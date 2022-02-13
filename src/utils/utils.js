const axios = require('axios');

const config = require('../config/config.json');

// eslint-disable-next-line no-promise-executor-return
const pause = async (duration) => new Promise((resolve) => setTimeout(resolve, duration));

const awaitNodeAvailable = async (interval = 200, attempts = 100) => {
  let result = null;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < attempts; i++) {
    // eslint-disable-next-line no-await-in-loop
    if (i) await pause(interval);
    // eslint-disable-next-line no-await-in-loop
    result = await axios.get('http://localhost:3001/v3/status').catch(() => null);
    if (result) return;
  }
  throw new Error('timed out waiting for node to come up');
};

const getNetwork = (network) => {
  const networks = {
    local: {
      url: config.localhostParams.url,
      networkId: config.localhostParams.networkId,
    },
    testnet: {
      url: config.testNetParams.url,
      networkId: config.testNetParams.networkId,
    },
    mainnet: {
      url: config.mainNetParams.url,
      networkId: config.mainNetParams.networkId,
    },
  };

  return networks[network];
};

module.exports = {
  // eslint-disable-next-line no-console
  print: console.log,
  // eslint-disable-next-line no-console
  printError: console.error,
  config,
  getNetwork,
  awaitNodeAvailable,
};
