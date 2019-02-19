const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs-extra');
const path = require('path');
const git = require('simple-git/promise')();
const Hjson = require('hjson');

const NODE_MODULES_LITERAL = 'node_modules';
const CONTRACTS_AEPP_LITERAL = 'contracts-aepp';
const YARN_LITERAL = 'yarn';
const CONTRACTS_AEPP_GITHUB_URL = 'git+https://github.com/aeternity/aepp-contracts#develop';
const CONTRACTS_SETTINGS_PATH = '/src/settings.js';
const FORGAE_SETTINGS_PATH = '/cli-commands/forgae-contracts/settings.js';
const DEFAULT_LOCAL_NODE_PORT = 3001;
const EXPORT_FILE_LITERAL = 'export default';

let nodeModulesPath;
let contractAeppProjectPath;

const run = async (options) => {
  await mainFlow(options);
};

const mainFlow = async (options) => {
  exec('npm list -g --depth 0', async function (error, stdout) {
    await installRepo();
    await getFreshlyInstalledContractsAeppPath();

    const yarnIsInstalled = checkGlobalModuleExistence(stdout, YARN_LITERAL);

    if (yarnIsInstalled) {
      await serveContractsAepp(options);
    } else {
      await installYarn();
      await serveContractsAepp(options);
    }
  });
};

const checkGlobalModuleExistence = (stdout, moduleName) => {
  const devDependenciesPath = stdout.split('\n')[0];
  nodeModulesPath = path.join(devDependenciesPath, NODE_MODULES_LITERAL);
  const modulesContent = fs.readdirSync(nodeModulesPath);
  return modulesContent.includes(moduleName);
};

const pullRepo = async (projectPath) => {
  console.log('====== Pulling Contracts web Aepp =====');
  const currentDir = process.cwd();
  process.chdir(projectPath);
  console.log(projectPath);

  await git.pull('origin', 'master');

  process.chdir(currentDir);
};

const installRepo = async () => {
  console.log('====== Installing Contracts web Aepp ======');
  await exec(`npm install -g ${CONTRACTS_AEPP_GITHUB_URL}`);
};

const installYarn = async () => {
  console.log('====== Installing yarn ======');
  await exec(`npm install -g ${YARN_LITERAL}`);
};

const serveContractsAepp = async (options) => {
  console.log('====== Starting Contracts web Aepp ======');
  const currentDir = process.cwd();
  process.chdir(contractAeppProjectPath);

  updateSettingsFile(options, currentDir);
  configureSettings(currentDir);

  await exec(`yarn install`);
  console.log('====== Contracts web Aepp is running on http://localhost:8080/ ======');
  console.log(`====== The Aepp is trying to connect to the spawned local node on http://localhost:${options.port ? options.port : DEFAULT_LOCAL_NODE_PORT}/ ======`);
  console.log('====== Please install browser extension which allows CORS. (Access-Control-Allow-Origin to perform cross-domain requests in the web application) ======');
  await exec(`yarn run start:dev`);

  process.chdir(currentDir);
};

const configureSettings = (currentDir) => {
  const contractsAeppDirectory = process.cwd();
  fs.copyFileSync(path.join(currentDir, FORGAE_SETTINGS_PATH), path.join(contractsAeppDirectory, CONTRACTS_SETTINGS_PATH));
};

const updateSettingsFile = (options, currentDir) => {
  const pathToForgaeSettings = path.join(currentDir, FORGAE_SETTINGS_PATH);
  const settingsContent = fs.readFileSync(pathToForgaeSettings, 'utf8');
  const jsonString = settingsContent.replace(EXPORT_FILE_LITERAL, '');
  const settingsObj = Hjson.parse(jsonString);
  settingsObj.host = `http://localhost:${options.port ? options.port : DEFAULT_LOCAL_NODE_PORT}/`;
  settingsObj.internalHost = `http://localhost:${options.port ? options.port : DEFAULT_LOCAL_NODE_PORT}/internal/`;
  const settingString = JSON.stringify(settingsObj);
  const replacementResult = `${EXPORT_FILE_LITERAL} ${settingString}`;
  fs.writeFileSync(pathToForgaeSettings, replacementResult);
};

const getFreshlyInstalledContractsAeppPath = () => {
  return new Promise((resolve, reject) => {
    exec('npm list -g --depth 0', async function (error, stdout) {
      const contractsAeppIsInstalled = checkGlobalModuleExistence(stdout, CONTRACTS_AEPP_LITERAL);

      if (contractsAeppIsInstalled) {
        contractAeppProjectPath = path.join(nodeModulesPath, CONTRACTS_AEPP_LITERAL);
        resolve();
      }
      reject();
    });
  })
};

module.exports = {
  run
};