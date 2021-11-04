const axios = require('axios');
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const { Universal, Node } = require('@aeternity/aepp-sdk');
const { spawn, exec } = require('promisify-child-process');

const config = require('../config/config.json');
const { printError } = require('./fs-utils');

const rgx = /^include\s+\"([\d\w\/\.\-\_]+)\"/gmi;
const dependencyPathRgx = /"([\d\w\/\.\-\_]+)\"/gmi;
const mainContractsPathRgx = /.*\//g;

const COMPILER_URL_POSTFIX = '/compile';

const getClient = async function (network, keypair = config.keypair) {
  let client;
  const internalUrl = network.url;

  const node = await Node({
    url: network.url,
    internalUrl,
    forceCompatibility: true,
  });

  await handleApiError(async () => {
    client = await Universal({
      nodes: [{
        name: 'ANY_NAME',
        instance: node,
      }],
      accounts: [AeSDK.MemoryAccount({
        keypair,
      })],
      nativeMode: true,
      networkId: network.networkId,
      compilerUrl: network.compilerUrl,
      forceCompatibility: true,
    });
  });

  return client;
};

const getNetwork = (network, networkId) => {
  if (networkId) {
    return createCustomNetwork(network, networkId);
  }

  const networks = {
    local: {
      url: config.localhostParams.url,
      networkId: config.localhostParams.networkId,
    },
    testnet: {
      url: config.testNetParams.url,
      networkId: config.testNetParams.networkId,
    },
    mainnet: {
      url: config.mainNetParams.url,
      networkId: config.mainNetParams.networkId,
    },
  };

  return networks[network] || createCustomNetwork(network, networkId);
};

const createCustomNetwork = (network, networkId) => {
  if (!network || !networkId || network === 'local') {
    throw new Error('Both [--network] and [--networkId] should be passed.');
  }

  network = network.toLowerCase();

  if (!network.startsWith('http')) {
    network = `http://${network}`;
  }

  return {
    url: network,
    networkId,
  };
};

const getCompiler = (network, compilerUrl) => {
  if (compilerUrl !== '') {
    return compilerUrl;
  }

  const compilers = {
    local: config.compilerUrl,
    testnet: config.hostedCompiler,
    mainnet: config.hostedCompiler,
  };

  if (!compilers[network]) {
    throw new Error('Compiler is not defined. You must provide compiler url or use predefined networks');
  }

  return compilers[network];
};

const handleApiError = async (fn) => {
  try {
    return await fn();
  } catch (e) {
    console.log(e);
    const { response } = e;
    logApiError(response && response.data ? response.data.reason : e);
    process.exit(1);
  }
};

function logApiError(error) {
  printError(`API ERROR: ${error}`);
}

const sleep = (ms) => {
  const start = Date.now();
  while (true) {
    const clock = (Date.now() - start);
    if (clock >= ms) break;
  }
};

const aeprojectExecute = async (command, args = [], options = {}) => execute('aeproject', command, args, options);

const execute = async (cli, command, args = [], options = {}) => {
  try {
    const child = await spawn(cli, [command, ...args], options);

    let result = child.stdout.toString('utf8');
    result += child.stderr.toString('utf8');

    return result;
  } catch (e) {
    console.log(e);

    let result = e.stdout ? e.stdout.toString('utf8') : e.message;
    result += e.stderr ? e.stderr.toString('utf8') : e.message;

    return result;
  }
};

const winExec = async (cli, cmd, args = [], options = {}) => {
  try {
    const child = await exec(`${cli} ${cmd} ${args.join(' ')}`, options);

    let result = readSpawnOutput(child);
    result += readErrorSpawnOutput(child);

    return result;
  } catch (e) {
    let result = readSpawnOutput(e);
    result += readErrorSpawnOutput(e);

    return result;
  }
};

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function readErrorSpawnOutput(spawnResult) {
  if (!spawnResult.stderr || spawnResult.stderr === '') {
    return '';
  }

  const buffMessage = Buffer.from(spawnResult.stderr);
  return `\n${buffMessage.toString('utf8')}`;
}

function readSpawnOutput(spawnResult) {
  if (!spawnResult || !spawnResult.stdout || spawnResult.stdout === '') {
    return '';
  }

  const buffMessage = Buffer.from(spawnResult.stdout);
  return buffMessage.toString('utf8');
}

async function contractCompile(source, contractPath, compileOptions) {
  let result;
  const options = {
    file_system: null,
  };

  options.file_system = getDependencies(source, contractPath);
  const body = {
    code: source,
    options,
  };
  const url = normalizeCompilerUrl(compileOptions.compilerUrl);
  result = await axios.post(url, body, options);

  return result;
}

function checkNestedProperty(obj, property) {
  if (!obj || !obj.hasOwnProperty(property)) {
    return false;
  }

  return true;
}

function getDependencies(contractContent, contractPath) {
  let allDependencies = [];
  let dependencyFromContract;
  let dependencyContractContent;
  let dependencyContractPath;
  let actualContract;
  const dependencies = {};

  if (!rgx.exec(contractContent)) {
    return dependencies;
  }

  allDependencies = contractContent.match(rgx);
  for (let index = 0; index < allDependencies.length; index++) {
    dependencyFromContract = dependencyPathRgx.exec(allDependencies[index]);
    dependencyPathRgx.lastIndex = 0;
    contractPath = mainContractsPathRgx.exec(contractPath);
    mainContractsPathRgx.lastIndex = 0;
    dependencyContractPath = path.resolve(`${contractPath[0]}/${dependencyFromContract[1]}`);

    try {
      dependencyContractContent = fs.readFileSync(dependencyContractPath, 'utf-8');
    } catch (error) {
      console.log(`File to include '${dependencyFromContract[1]}' not found. Check your path or it is from Sophia default library`);
      if (!error.message.includes('no such file or directory')) {
        throw Error(error);
      }
    }

    actualContract = getActualContract(dependencyContractContent);
    if (!dependencyFromContract[1].startsWith('./')) {
      dependencies[`./${dependencyFromContract[1]}`] = actualContract;
    } else {
      dependencies[dependencyFromContract[1]] = actualContract;
    }

    Object.assign(dependencies, getDependencies(dependencyContractContent, dependencyContractPath));
  }

  return dependencies;
}

function getActualContract(contractContent) {
  if (!contractContent) {
    return '';
  }

  let contentStartIndex = contractContent.indexOf('namespace ');
  if (contentStartIndex < 0) {
    contentStartIndex = 0;
  }

  return contractContent.substr(contentStartIndex);
}

function normalizeCompilerUrl(url) {
  if (!url.startsWith('http')) {
    url = `http://${url}`;
  }

  if (!url.endsWith(COMPILER_URL_POSTFIX)) {
    if (url.endsWith('/')) {
      url += COMPILER_URL_POSTFIX.substr(1);
    } else {
      url += COMPILER_URL_POSTFIX;
    }
  }

  return url;
}

function capitalize(_string) {
  if (typeof _string !== 'string') return '';
  return _string.charAt(0).toUpperCase() + _string.slice(1);
}

const addCaretToDependencyVersion = (dependecy) => {
  const pJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), './package.json'), 'utf8'));

  const libVersion = pJson.dependencies[dependecy];

  if (!libVersion) {
    return;
  }

  if (!libVersion.startsWith('^')) {
    pJson.dependencies[dependecy] = `^${libVersion}`;
  }

  fs.writeFileSync(path.resolve(process.cwd(), './package.json'), JSON.stringify(pJson), 'utf8');
};

async function prompt(promptMessage, functionToExecute) {
  const args = [...arguments];
  // [0] - promptMessage
  // [1] - function to execute
  // [..] rest = function arguments

  // // Prompt user to input data in console.
  const response = await prompts({
    type: 'text',
    name: 'value',
    message: `${promptMessage} (YES/Y/yes/y || No/no/N/n):`,
    // validate: value => value < 18 ? `some validation text` : true
  });

  const input = response.value;
  if (input === 'YES' || input === 'yes' || input === 'Y' || input === 'y') {
    return functionToExecute(...args.slice(2));
  }

  return null;
}

module.exports = {
  config,
  getClient,
  getNetwork,
  getCompiler,
  handleApiError,
  logApiError,
  sleep,
  aeprojectExecute,
  execute,
  timeout,
  contractCompile,
  checkNestedProperty,
  winExec,
  readSpawnOutput,
  readErrorSpawnOutput,
  capitalize,
  addCaretToDependencyVersion,
  prompt,
};
