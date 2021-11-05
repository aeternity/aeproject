const config = require('../config/config.json');

const getNetwork = (network, networkId) => {
  if (networkId) {
    return createCustomNetwork(network, networkId);
  }

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

  return networks[network] || createCustomNetwork(network, networkId);
};

const createCustomNetwork = (network, networkId) => {
  if (!network || !networkId || network === 'local') {
    throw new Error('Both [--network] and [--networkId] should be passed.');
  }

  network = network.toLowerCase();

  if (!network.startsWith('http')) {
    network = `http://${network}`;
  }

  return {
    url: network,
    networkId,
  };
};

module.exports = {
  print: console.log,
  printError: console.error,
  config,
  getNetwork,
};
