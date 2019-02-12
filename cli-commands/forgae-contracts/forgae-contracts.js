const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');
const git = require('simple-git/promise')();

const NODE_MODULES_LITERAL = 'node_modules';
const CONTRACTS_AEPP_LITERAL = 'contracts-aepp';
const YARN_LITERAL = 'yarn';
const CONTRACTS_AEPP_GITHUB_URL = 'git+https://github.com/aeternity/aepp-contracts.git';

let nodeModulesPath;

const run = async () => {
  exec('npm list -g --depth 0', async function (error, stdout) {
    let contractAeppProjectPath;

    const contractsAeppIsInstalled = checkGlobalModuleExistence(stdout, CONTRACTS_AEPP_LITERAL);

    if (contractsAeppIsInstalled) {
      contractAeppProjectPath = path.join(nodeModulesPath, CONTRACTS_AEPP_LITERAL);
      await pullRepo(contractAeppProjectPath, CONTRACTS_AEPP_GITHUB_URL);
    } else {
      await installRepo();
    }

    const yarnIsInstalled = checkGlobalModuleExistence(stdout, YARN_LITERAL);

    if (yarnIsInstalled) {
      await serveContractsAepp(contractAeppProjectPath);
    } else {
      await exec(`npm install -g ${YARN_LITERAL}`);
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

  await git.pull('origin', 'master');

  process.chdir(currentDir);
};

const installRepo = async () => {
  console.log('====== Installing Contracts web Aepp ======');
  await exec(`npm install -g ${CONTRACTS_AEPP_GITHUB_URL}`);
};

const serveContractsAepp = async (contractAeppProjectPath) => {
  console.log('====== Starting Contracts web Aepp ======');
  const currentDir = process.cwd();
  process.chdir(contractAeppProjectPath);

  await exec(`yarn install`);
  await exec(`yarn run start:dev`);

  process.chdir(currentDir);
};

module.exports = {
  run
};