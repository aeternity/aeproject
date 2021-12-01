const config = require('../config/config.json');

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
};
