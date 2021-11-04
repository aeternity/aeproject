const {
  printError,
  print,
} = require('../../../utils');

const nodeConfig = require('../../../config');

const compilerConfigs = nodeConfig.compilerConfiguration;

const DEFAULT_COMPILER_PORT = 3080;

const EnvService = require('../../EnvService');

class Compiler extends EnvService {
  constructor() {
    super('compiler');
  }

  async run(option) {
    const compilerImage = compilerConfigs.dockerServiceCompilerName;
    let { compilerVersion } = compilerConfigs;

    if (option.v) {
      compilerVersion = option.v;
    }

    try {
      let running = await super.isImageRunning(compilerImage);

      if (option.info) {
        await super.printInfo(running);
        return;
      }

      if (option.stop) {
        // if not running, current env may be windows
        // to reduce optional params we check is it running on windows env
        if (!running) {
          running = await super.isImageRunning(compilerImage);
        }

        if (!running) {
          printError('===== Compiler is not running! =====');
          return;
        }

        super.printInitialStopMsg();

        try {
          await super.stopCompiler();
        } catch (error) {
          printError(Buffer.from(error.stderr).toString('utf-8'));
        }

        return;
      }

      if (!await this.shouldProcessStart(running)) return;

      super.printStarMsg();

      await super.start(compilerImage, null, compilerVersion);

      super.printSuccessMsg();
    } catch (e) {
      printError(e.message || e);
    }
  }

  async shouldProcessStart(running) {
    if (!super.hasCompilerConfigFiles()) {
      print('Process will be terminated!');
      return false;
    }

    if (running) {
      print('\r\n===== Compiler already started and healthy! =====');
      return false;
    }

    if (await super.checkForAllocatedPort(DEFAULT_COMPILER_PORT)) {
      print(`\r\n===== Port [${DEFAULT_COMPILER_PORT}] is already allocated! Process will be terminated! =====`);
      print('Cannot start AE compiler, port is already allocated!');
      return false;
    }

    return true;
  }
}

const compiler = new Compiler();

module.exports = {
  run: async (options) => {
    await compiler.run(options);
  },
};
