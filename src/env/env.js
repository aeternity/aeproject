const { spawn, exec } = require('promisify-child-process');

const { print, printError, ensureNodeAndCompilerAvailable } = require('../utils/utils');
const { nodeConfiguration, compilerConfiguration, proxyConfiguration } = require('../config/node-config.json');

let dockerComposeCmd = 'docker compose';

async function getDockerCompose() {
  const dockerSpaceCompose = await spawn('docker', ['compose']).catch(() => ({ code: 1 }));
  if (dockerSpaceCompose.code === 0) return;
  const dockerMinusCompose = await spawn('docker-compose').catch(() => ({ code: 1 }));
  if (dockerMinusCompose.code === 0) {
    dockerComposeCmd = 'docker-compose';
    return;
  }

  throw new Error('===== docker compose is not installed! =====');
}

async function isEnvRunning(cwd = './') {
  const info = await getInfo(cwd);

  if (info) {
    const containers = [
      nodeConfiguration.containerName,
      compilerConfiguration.containerName,
      proxyConfiguration.containerName,
    ];
    return containers.some((containerName) => {
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

  await getDockerCompose();
  await exec(`${dockerComposeCmd} down -v`);

  print('===== Env was successfully stopped! =====');
}

async function startEnv(nodeVersion, compilerVersion) {
  if (await isEnvRunning()) {
    printError('===== Compiler or Node is already running! =====');
  } else {
    print('===== starting env =====');

    await getDockerCompose();
    await exec(`NODE_TAG=${nodeVersion} COMPILER_TAG=${compilerVersion} ${dockerComposeCmd} pull`);
    await exec(`NODE_TAG=${nodeVersion} COMPILER_TAG=${compilerVersion} ${dockerComposeCmd} up -d --wait`);

    await ensureNodeAndCompilerAvailable();

    print('===== Env was successfully started! =====');
  }
}

async function printInfo(running) {
  if (!running) {
    printError('===== Compiler or Node is not running! ===== \n===== Please run the relevant command for your image! =====');
    return;
  }

  print(await getInfo());
}

async function getInfo(cwd) {
  await getDockerCompose();
  const ps = await exec(`${dockerComposeCmd} ps`, { cwd });
  const images = await exec(`${dockerComposeCmd} images`, { cwd });

  if (ps && images && ps.stdout && images.stdout) {
    return `${ps.stdout}\n${images.stdout}`;
  }

  return null;
}

module.exports = {
  run,
  isEnvRunning,
};
