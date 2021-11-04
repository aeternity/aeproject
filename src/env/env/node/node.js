const {
  printError,
  print,
} = require('../../../utils');

const nodeConfig = require('../../../config');

const { nodeConfiguration } = nodeConfig;

const DEFAULT_NODE_PORT = 3001;

const EnvService = require('../../EnvService');

class Node extends EnvService {
  constructor() {
    super('node');
  }

  async run(option) {
    const dockerImage = nodeConfiguration.dockerServiceNodeName;

    let { nodeVersion } = nodeConfiguration;

    if (option.v) {
      nodeVersion = option.v;
    }

    try {
      const running = await super.isImageRunning(dockerImage);

      if (option.info) {
        await super.printInfo(running);
        return;
      }

      if (option.stop) {
        // if not running, current env may be windows
        // to reduce optional params we check is it running on windows env

        // TODO block below to be deleted if tests for windows pass! Needs to be verified.
        // if (!running) {
        //     running = await super.isImageRunning(dockerImage);
        // }

        if (!running) {
          print('===== Node is not running! =====');
          return;
        }

        super.printInitialStopMsg();

        try {
          await super.stopNode();
        } catch (error) {
          printError(Buffer.from(error.stderr).toString('utf-8'));
        }

        return;
      }

      if (!await this.shouldProcessStart(running)) return;

      super.printStarMsg();

      await super.start(dockerImage, nodeVersion, null);

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

  async shouldProcessStart(running) {
    if (!super.hasNodeConfigFiles()) {
      print('Process will be terminated!');
      return false;
    }

    if (running) {
      print('\r\n===== Node already started and healthy! =====');
      return false;
    }

    if (await super.checkForAllocatedPort(DEFAULT_NODE_PORT)) {
      print(`\r\n===== Port [${DEFAULT_NODE_PORT}] is already allocated! Process will be terminated! =====`);
      printError('Cannot start AE node, port is already allocated!');
      return false;
    }

    return true;
  }
}

const node = new Node();

module.exports = {
  run: async (options) => {
    await node.run(options);
  },
};
