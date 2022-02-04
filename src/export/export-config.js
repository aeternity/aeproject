const path = require('path');
const config = require('../config');
const utils = require('../utils');
const aeprojectConfigDefaultFileName = require('./constants').aeprojectConfigFileName;

const DEFAULT_NUMBER_OF_WALLETS = 3;

function exportMinerWallet(keypair) {
  return {
    minerWallet: {
      publicKey: keypair.publicKey,
      secretKey: keypair.secretKey,
    },
  };
}

function exportWallets(defaultWallets) {
  const wallets = [];
  let index = 0;
  for (const defaultWallet of defaultWallets) {
    if (index >= DEFAULT_NUMBER_OF_WALLETS) {
      break;
    }

    wallets.push(
      {
        publicKey: defaultWallet.publicKey,
        secretKey: defaultWallet.secretKey,
      },
    );

    index++;
  }

  return wallets;
}

function exportNodeConfiguration(config) {
  const localHostParams = config.localhostParams;

  const localhostConfig = {
    networkId: localHostParams.networkId,
    host: localHostParams.url,
    internalHost: localHostParams.url,
    compilerUrl: config.compilerUrl,
  };

  return localhostConfig;
}

async function writeToFile(aeprojectConfig, destination) {
  await utils.createDirIfNotExists(destination);
  if (!destination.endsWith('.json')) {
    destination = path.join(
      destination,
      aeprojectConfigDefaultFileName,
    );
  }

  utils.writeFileSync(destination, JSON.stringify(aeprojectConfig));
}

async function run(options) {
  const localHostConfig = exportNodeConfiguration(config);
  const minerKeyPair = exportMinerWallet(config.keypair);
  const defaultWallets = exportWallets(config.defaultWallets);

  let aeprojectConfig = { ...localHostConfig };
  aeprojectConfig = Object.assign(aeprojectConfig, minerKeyPair);
  aeprojectConfig.defaultWallets = defaultWallets;

  console.log(JSON.stringify(aeprojectConfig, null, 2));
  await writeToFile(aeprojectConfig, options.path);
}

module.exports = {
  run,
};
