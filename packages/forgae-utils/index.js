const {printReportTable, getReadableStatus} = require('./logger-utils');
const print = require('./utils').print;
const printError = require('./utils').printError;
const createMissingFolder = require('./utils').createMissingFolder;
const copyFileOrDir = require('./utils').copyFileOrDir;
const getFiles = require('./utils').getFiles;
const getClient = require('./utils').getClient;
const getNetwork = require('./utils').getNetwork;
const sleep = require('./utils').sleep;
const execute = require('./utils').execute;
const readFile = require('./utils').readFile;
const config = require('./utils').config;
const keyToHex = require('./utils').keyToHex;
const forgaeExecute = require('./utils').forgaeExecute;
const isKeyPair = require('./utils').isKeyPair;
const generatePublicKeyFromSecretKey = require('./utils').generatePublicKeyFromSecretKey;
const timeout = require('./utils').timeout;
const generateKeyPairFromSecretKey = require('./utils').generateKeyPairFromSecretKey;
const decodedHexAddressToPublicAddress = require('./utils').decodedHexAddressToPublicAddress;

module.exports = {
    printReportTable,
    getReadableStatus,
    print,
    printError,
    createMissingFolder,
    copyFileOrDir,
    getFiles,
    getClient,
    getNetwork,
    sleep,
    execute,
    readFile,
    config,
    keyToHex,
    forgaeExecute,
    isKeyPair,
    generatePublicKeyFromSecretKey,
    timeout,
    generateKeyPairFromSecretKey,
    decodedHexAddressToPublicAddress
}