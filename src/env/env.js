const { spawn, exec } = require('promisify-child-process');

const { print, printError } = require('../utils/utils');
const { nodeConfiguration, compilerConfiguration, proxyConfiguration } = require('../config/node-config.json');

async function isEnvRunning() {
  const info = await getInfo();

  if (info) {
    const containers = [
      nodeConfiguration.containerName,
      compilerConfiguration.containerName,
      proxyConfiguration.containerName,
    ];
    return containers.every((containerName) => {
      const line = info.split('\n').find((l) => l.includes(containerName));
      return line && (line.includes('Up') || line.includes('running'));
    });
  }

  return false;
}

async function run(option) {
  const nodeVersion = option.nodeVersion || nodeConfiguration.imageVersion;
  const compilerVersion = option.compilerVersion || compilerConfiguration.imageVersion;

  const running = await isEnvRunning();

  if (option.info) {
    await printInfo(running);
    return;
  }

  if (option.stop) {
    await stopEnv(running);
    return;
  }

  await startEnv(nodeVersion, compilerVersion);
}

async function stopEnv(running) {
  if (!running) {
    printError('===== Env is not running! =====');
    return;
  }

  print('===== stopping env =====');

  await spawn('docker-compose', [
    'down',
    '-v',
  ]);

  print('===== Env was successfully stopped! =====');
}

async function startEnv(nodeVersion, compilerVersion) {
  print('===== starting env =====');

  await exec(`NODE_TAG=${nodeVersion} COMPILER_TAG=${compilerVersion} docker-compose pull`);
  await exec(`NODE_TAG=${nodeVersion} COMPILER_TAG=${compilerVersion} docker-compose up -d`);

  print('===== Env was successfully started! =====');
}

async function printInfo(running) {
  if (!running) {
    printError('===== Compiler or Node is not running! ===== \n===== Please run the relevant command for your image! =====');
    return;
  }

  print(await getInfo());
}

async function getInfo() {
  const info = await exec('docker-compose ps');

  if (info && info.stdout) {
    return info.stdout;
  }

  return null;
}

module.exports = {
  run,
};
