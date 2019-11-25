const localhostParams = require('./config/config.json').localhostParams;
const testNetParams = require('./config/config.json').testNetParams;
const mainNetParams = require('./config/config.json').mainNetParams;
const keypair = require('./config/config.json').keypair;
const compilerUrl = require('./config/config.json').compilerUrl;

const config = require('./config/node-config.json').config;
const defaultWallets = require('./config/node-config.json').defaultWallets;
const nodeConfiguration = require('./config/node-config.json').nodeConfiguration;
const compilerConfiguration = require('./config/node-config.json').compilerConfiguration;

module.exports = {
    localhostParams,
    testNetParams,
    mainNetParams,
    keypair,
    compilerUrl,
    config,
    defaultWallets,
    nodeConfiguration,
    compilerConfiguration
}
