const {print, printError, readSpawnOutput,} = require('../../utils');
const { nodeConfiguration, compilerConfiguration } = require('../../config');

const EnvService = require('../EnvService');

class Env extends EnvService {
  constructor() {
    super('');
  }

  async printInfo(running) {
    if (!running) {
      printError('===== Compiler or Node is not running! ===== \n===== Please run the relevant command for your image! =====');
      return;
    }

    const dockerInfoBuffer = await this.getInfo();
    const result = readSpawnOutput(dockerInfoBuffer);

    print(result);
  }

  async areNodeAndCompilerRunning(...images) {
    let running = true;

    for (const currImage in images) {
      running = await super.isImageRunning(images[currImage]) && running;
    }

    return running;
  }

  async run(option) {
    let running;
    const dockerImage = nodeConfiguration.dockerServiceNodeName;
    const compilerImage = compilerConfiguration.dockerServiceCompilerName;

    let { nodeVersion } = nodeConfiguration;
    let { compilerVersion } = compilerConfiguration;

    if (option.nodeVersion) {
      nodeVersion = option.nodeVersion;
    }

    if (option.compilerVersion) {
      compilerVersion = option.compilerVersion;
    }

    running = await this.areNodeAndCompilerRunning(dockerImage, compilerImage);

    if (option.info) {
      await this.printInfo(running);
      return;
    }

    if (option.stop) {
      // if not running, current env may be windows
      // to reduce optional params we check is it running on windows env
      if (!running) {
        // TODO line below to be deleted if tests for windows pass! Needs to be verified.
        // running = await this.areNodeAndCompilerRunning(dockerImage, compilerImage)
        printError('===== Compiler or Node is not running! ===== \n===== Please run the relevant command for your image! =====');
        return;
      }

      super.printInitialStopMsg();

      try {
        await super.stopAll();
      } catch (error) {
        printError(Buffer.from(error.stderr).toString('utf-8'));
      }

      return;
    }

    if (!await super.shouldProcessStart(running)) return;

    try {
      super.printStarMsg();

      await super.start(dockerImage, nodeVersion, compilerVersion);

      super.printSuccessMsg();

      if (option.windows) {
        const dockerIp = super.removePrefixFromIp(option.dockerIp);
        await super.fundWallets(dockerIp);
      } else {
        await super.fundWallets();
      }

      print('\r\n===== Default wallets were successfully funded! =====');
    } catch (e) {
      printError(e.message || e);
    }
  }
}

const env = new Env();

module.exports = {
  run: async (options) => {
    await env.run(options);
  },
};
