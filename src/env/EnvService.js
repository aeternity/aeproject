// TODO replace nodeStore/Service
const { exec, spawn } = require('promisify-child-process');

const fs = require('fs');
const path = require('path');
const {print, readSpawnOutput, readErrorSpawnOutput, sleep, capitalize,} = require('../utils');
const utils = require('../utils');

const nodeConfig = require('../config');

const { config } = nodeConfig;

const { defaultWallets } = nodeConfig;
let network = nodeConfig.localhostParams;
network.compilerUrl = nodeConfig.localhostParams.compilerUrl;

const compilerConfigs = nodeConfig.compilerConfiguration;
const { nodeConfiguration } = nodeConfig;

const DEFAULT_COMPILER_PORT = 3080;
const DEFAULT_NODE_PORT = 3001;
const MAX_SECONDS_TO_RUN_NODE = 90;
const DefaultColumnVariable = 'export COLUMNS=1000';

const POSSIBLE_ERRORS = [
  'port is already allocated',
  'address already in use',
  'not found',
  // messages when docker is blocked by firewall
  'request canceled',
  'Temporary failure in name resolution',
  'registry-1.docker.io',
  'forbidden by its access permissions',
];

const isWindowsPlatform = process.platform === 'win32';

class EnvService {
  constructor(unit) {
    this._unit = unit;
  }

  async shouldProcessStart(running) {
    if (!this.hasConfigFiles()) {
      print('Process will be terminated!');
      return false;
    }

    if (running) {
      print('===== Compiler or Node is already running! ===== \n===== Please run the relevant command to start an image alone! =====');
      return false;
    }

    if (await this.checkForAllocatedPort(DEFAULT_NODE_PORT, DEFAULT_COMPILER_PORT)) {
      print(`\r\n===== Port [${DEFAULT_COMPILER_PORT}] or Port [${DEFAULT_NODE_PORT}] is already allocated! Process will be terminated! =====`);
      print('Cannot start AE env, port is already allocated!');
      return false;
    }
    return true;
  }

  hasConfigFiles() {
    return this.hasCompilerConfigFiles() && this.hasNodeConfigFiles();
  }

  hasNodeConfigFiles() {
    const neededNodeConfigFile = nodeConfiguration.configFileName;
    const nodeConfigFilePath = path.resolve(process.cwd(), neededNodeConfigFile);

    const doesNodeConfigFileExists = fs.existsSync(nodeConfigFilePath);

    if (!doesNodeConfigFileExists) {
      print(`Missing ${neededNodeConfigFile} file!`);
      return false;
    }

    let nodeFileContent = fs.readFileSync(nodeConfigFilePath, 'utf-8');

    nodeFileContent = nodeFileContent.replace(/'/g, '');

    if (nodeFileContent.indexOf(nodeConfiguration.textToSearch) < 0) {
      print(`Invalid ${neededNodeConfigFile} file!`);
      return false;
    }

    return true;
  }

  hasCompilerConfigFiles() {
    const neededCompilerConfigFile = compilerConfigs.configFileName;
    const compilerConfigFilePath = path.resolve(process.cwd(), neededCompilerConfigFile);

    const doesCompilerConfigFileExists = fs.existsSync(compilerConfigFilePath);

    if (!doesCompilerConfigFileExists) {
      print(`Missing ${neededCompilerConfigFile} file!`);
      return false;
    }

    const compilerFileContent = fs.readFileSync(compilerConfigFilePath, 'utf-8');

    if (compilerFileContent.indexOf(compilerConfigs.textToSearch) < 0) {
      print(`Invalid  ${neededCompilerConfigFile} file!`);
      return false;
    }

    return true;
  }

  async start(image, nodeVersion, compilerVersion) {
    let nodeVerEnvVar = `export ${nodeConfiguration.envLiteral}=${nodeVersion}`;
    let compilerVerEnvVar = `export ${compilerConfigs.envLiteral}=${compilerVersion}`;
    if (isWindowsPlatform) {
      nodeVerEnvVar = `set "${nodeConfiguration.envLiteral}=${nodeVersion}"`;
      compilerVerEnvVar = `set "${compilerConfigs.envLiteral}=${compilerVersion}"`;
    }

    let runCommand;
    switch (this._unit) {
      case 'compiler':
        runCommand = exec(`${compilerVerEnvVar} &&  docker-compose -f docker-compose.compiler.yml up -d`);
        nodeService.save(this._unit);
        break;
      case 'node':
        runCommand = exec(`${nodeVerEnvVar} && docker-compose -f docker-compose.yml up -d`);
        nodeService.save(this._unit);
        break;
      default:
        runCommand = exec(`${nodeVerEnvVar} && ${compilerVerEnvVar} && docker-compose -f docker-compose.yml -f docker-compose.compiler.yml up -d`);
        nodeService.save();
    }

    // toggle loader
    if (runCommand.stdout) {
      runCommand.stdout.on('data', (data) => {
        print(data.toString('utf8'));
      });
    }

    let errorMessage = '';
    if (runCommand.stderr) {
      runCommand.stderr.on('data', (data) => {
        errorMessage += data.toString();
        console.log(data.toString('utf8'));
      });
    }

    let counter = 0;
    while (!(await this.isImageRunning(`${image}`))) {
      for (const possibleError of POSSIBLE_ERRORS) {
        if (errorMessage.indexOf(possibleError) >= 0) {
          await this.stopAll();
          console.log('Cannot start AE Node!');
          throw new Error(errorMessage);
        }
      }

      process.stdout.write('.');
      sleep(1000);

      // prevent infinity loop
      counter++;
      if (counter >= MAX_SECONDS_TO_RUN_NODE) {
        // if node is started and error message is another,
        // we should stop docker

        await this.stopAll();
        throw new Error('Cannot start AE Node!');
      }
    }

    return runCommand;
  }

  async stopAll() {
    if (nodeService.getNodePath() && nodeService.getCompilerPath()) {
      await this.stopNode();
      await this.stopCompiler();
    } else if (nodeService.getNodePath()) {
      await this.stopNode();
    } else if (nodeService.getCompilerPath()) {
      await this.stopCompiler();
    }
  }

  async stopNode() {
    try {
      await spawn('docker-compose', [
        '-f',
        `${nodeService.getNodePath()}`,
        'down',
      ]);

      print('===== Node was successfully stopped! =====');
      return nodeService.delete('node');
    } catch (error) {
      if (readErrorSpawnOutput(error).indexOf('active endpoints')) {
        nodeService.delete('node');
        return print('===== Node was successfully stopped! =====');
      }

      throw new Error(error);
    }
  }

  async stopCompiler() {
    try {
      await spawn('docker-compose', [
        '-f',
        `${nodeService.getCompilerPath()}`,
        'down',
      ]);

      print('===== Compiler was successfully stopped! =====');

      return nodeService.delete('compiler');
    } catch (error) {
      if (readErrorSpawnOutput(error).indexOf('active endpoints')) {
        nodeService.delete('compiler');
        return print('===== Compiler was successfully stopped! =====');
      }

      throw new Error(error);
    }
  }

  async getInfo(options) {
    const nodePath = nodeService.getNodePath();
    const compilerPath = nodeService.getCompilerPath();

    if (isWindowsPlatform) {
      if (!this._unit && nodePath && compilerPath) {
        return exec(`docker-compose -f ${nodePath} -f ${compilerPath} ps`, options);
      } if (this._unit.indexOf('node') >= 0 && nodePath) {
        return exec(`docker-compose -f ${nodePath} ps`, options);
      } if (this._unit.indexOf('compiler') >= 0 && compilerPath) {
        return exec(`docker-compose -f ${compilerPath} ps`, options);
      }
      return exec('docker-compose -f docker-compose.yml -f docker-compose.compiler.yml ps', options);
    } if (!this._unit && nodePath && compilerPath) {
      return exec(`${DefaultColumnVariable} && docker-compose -f ${nodePath} -f ${compilerPath} ps`, options);
    } if (this._unit.indexOf('node') >= 0 && nodePath) {
      return exec(`${DefaultColumnVariable} && docker-compose -f ${nodePath} ps`, options);
    } if (this._unit.indexOf('compiler') >= 0 && compilerPath) {
      return exec(`${DefaultColumnVariable} && docker-compose -f ${compilerPath} ps`, options);
    }
    return exec(`${DefaultColumnVariable} && docker-compose -f docker-compose.yml -f docker-compose.compiler.yml ps`, options);
  }

  async printInfo(running) {
    if (!running) {
      print(`===== ${capitalize(this._unit)} is not running! =====`);
      return;
    }

    const buff = await this.getInfo();
    const res = readSpawnOutput(buff);

    print(res);
  }

  async isImageRunning(image, options) {
    try {
      let running = false;

      const result = await this.getInfo(options);

      let res = readSpawnOutput(result);

      if (res) {
        res = res.split('\n');
      }

      if (Array.isArray(res)) {
        res.map((line) => {
          if (line.indexOf(image) >= 0 && line.includes('healthy')) {
            running = true;
          }
        });
      }

      return running;
    } catch (error) {
      if (this.checkForMissingDirectory(error)) {
        return false;
      }

      if (error.stderr) {
        console.log(error.stderr.toString('utf8'));
      } else {
        console.log(error.message || error);
      }

      throw Error(error);
    }
  }

  checkForMissingDirectory(e) {
    return (e.stderr && e.stderr.toString('utf-8').indexOf('No such file or directory') >= 0);
  }

  async checkForAllocatedPort(...portArgs) {
    let isAllocated = false;

    for (const port in portArgs) {
      try {
        const scanForAllocatedPort = await spawn('lsof', ['-i', `:${portArgs[port]}`]);

        if (scanForAllocatedPort.stdout) {
          isAllocated = scanForAllocatedPort.stdout.toString('utf8').length > 0;
        }
      } catch (e) {
        // Throws an error when there is no running port. Exceptions are handled elsewhere.
        isAllocated = false || isAllocated;
      }
    }

    return isAllocated;
  }

  printSuccessMsg() {
    switch (this._unit) {
      case 'compiler':
        print(`\n\r===== ${capitalize(this._unit)} was successfully started! =====`);
        break;
      case 'node':
        print(`\n\r===== ${capitalize(this._unit)} was successfully started! =====`);
        print('===== Funding default wallets! =====');
        break;
      default:
        print('\n\r===== Node was successfully started! =====');
        print('===== Compiler was successfully started! =====');
        print('===== Funding default wallets! =====');
    }
  }

  printStarMsg() {
    switch (this._unit) {
      case 'compiler':
      case 'node':
        print(`===== Starting ${capitalize(this._unit)} =====`);
        break;
      default:
        print('===== Starting node and compiler =====');
    }
  }

  async printInitialStopMsg() {
    switch (this._unit) {
      case 'compiler':
      case 'node':
        print(`===== Stopping ${capitalize(this._unit)}  =====`);
        break;
      default:
        print('===== Stopping node and compiler  =====');
    }
  }

  removePrefixFromIp(ip) {
    if (!ip) {
      return '';
    }

    return ip.replace('http://', '').replace('https://', '');
  }

  async fundWallets(nodeIp) {
    await this.waitToMineCoins(nodeIp);

    let walletIndex = 0;

    const client = await utils.getClient(network);
    await this.printBeneficiaryKey(client);
    for (const wallet in defaultWallets) {
      await this.fundWallet(client, defaultWallets[wallet].publicKey);
      await this.printWallet(client, defaultWallets[wallet], `#${walletIndex++}`);
    }
  }

  async waitToMineCoins(nodeIp) {
    try {
      if (nodeIp) {
        network = JSON.parse(JSON.stringify(network).replace(/localhost/g, nodeIp));
      }

      const client = await utils.getClient(network);
      const heightOptions = {
        interval: 8000,
        attempts: 300,
      };
      return await client.awaitHeight(10, heightOptions);
    } catch (error) {
      throw Error(error);
    }
  }

  async printBeneficiaryKey(client) {
    await this.printWallet(client, config.keyPair, 'Miner');
  }

  async printWallet(client, keyPair, label) {
    const keyPairBalance = await client.balance(keyPair.publicKey);

    print(`${label} ------------------------------------------------------------`);
    print(`public key: ${keyPair.publicKey}`);
    print(`private key: ${keyPair.secretKey}`);
    print(`Wallet's balance is ${keyPairBalance}`);
  }

  async fundWallet(client, recipient) {
    await client.spend(config.amountToFund, recipient);
  }
}

module.exports = EnvService;
