const localhostParams = require('./config/config.json').localhostParams;
const testnetParams = require('./config/config.json').testnetParams;
const mainnetParams = require('./config/config.json').mainnetParams;
const customnetParams = require('./config/config.json').customnetParams;
const keypair = require('./config/config.json').keypair;
const compilerUrl = require('./config/config.json').compilerUrl;
const compilerVersion = require('./config/config.json').compilerVersion;

const config = require('./config/node-config.json').config;
const defaultWallets = require('./config/node-config.json').defaultWallets;
const dockerConfiguration = require('./config/node-config.json').dockerConfiguration;
const localCompiler = require('./config/node-config.json').localCompiler;

module.exports = {
    localhostParams,
    testnetParams,
    mainnetParams,
    customnetParams,
    keypair,
    compilerUrl,
    compilerVersion,
    config,
    defaultWallets,
    dockerConfiguration,
    localCompiler
}
