const { exec } = require('promisify-child-process');
const { print } = require('../utils/utils');

const nodeConfig = require('../config/node-config.json').nodeConfiguration;

async function run(option) {
  let { nodeVersion } = option;
  let { compilerVersion } = option;

  if (nodeVersion && compilerVersion) {
    print(`===== Testing current project with node ${nodeVersion} and compiler ${compilerVersion} version =====`);
  } else if (nodeVersion && !compilerVersion) {
    print(`===== Testing current project with node ${nodeVersion} and latest compiler version =====`);
    compilerVersion = 'latest';
  } else if (!nodeVersion && compilerVersion) {
    print(`===== Testing current project with compiler ${compilerVersion} and latest node version =====`);
    nodeVersion = 'latest';
  } else {
    print('===== Testing current project with latest node and compiler version =====');
    compilerVersion = 'latest';
    nodeVersion = 'latest';
  }

  let cmdToExecute = `aeproject env --nodeVersion ${nodeVersion} --compilerVersion ${compilerVersion}`;
  if (option.windows) {
    cmdToExecute += ` --windows --docker-ip ${option.dockerIp ? option.dockerIp : nodeConfig.dockerMachineIP}`;
  }

  console.log('Starting environment...');
  await exec(cmdToExecute);

  try {
    console.log('Running tests...');

    const testResult = await exec('aeproject test');
    printChildProcessResult(testResult);
  } catch (error) {
    console.log(error.stdout);
    console.log(error.stderr);
  }

  const stopResult = await exec('aeproject env --stop');
  printChildProcessResult(stopResult);
}

const printChildProcessResult = (childProcess) => {
  console.log(childProcess.stdout);
  console.log(childProcess.stderr);
};

module.exports = {
  run,
};
