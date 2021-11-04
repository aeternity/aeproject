const { localhostParams } = require('./config.json');
const { testNetParams } = require('./config.json');
const { mainNetParams } = require('./config.json');
const { keypair } = require('./config.json');
const { compilerUrl } = require('./config.json');

const { config } = require('./node-config.json');
const { defaultWallets } = require('./node-config.json');
const { nodeConfiguration } = require('./node-config.json');
const { compilerConfiguration } = require('./node-config.json');

module.exports = {
  localhostParams,
  testNetParams,
  mainNetParams,
  keypair,
  compilerUrl,
  config,
  defaultWallets,
  nodeConfiguration,
  compilerConfiguration,
};
