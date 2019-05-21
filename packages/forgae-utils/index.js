const {printReportTable, getReadableStatus} = require('./utils/logger-utils');
const print = require('./utils/utils').print;
const printError = require('./utils/utils').printError;
const createMissingFolder = require('./utils/utils').createMissingFolder;
const copyFileOrDir = require('./utils/utils').copyFileOrDir;
const getFiles = require('./utils/utils').getFiles;
const getClient = require('./utils/utils').getClient;
const getNetwork = require('./utils/utils').getNetwork;
const sleep = require('./utils/utils').sleep;
const execute = require('./utils/utils').execute;
const config = require('./utils/utils').config;
const keyToHex = require('./utils/utils').keyToHex;
const forgaeExecute = require('./utils/utils').forgaeExecute;
const isKeyPair = require('./utils/utils').isKeyPair;
const generatePublicKeyFromSecretKey = require('./utils/utils').generatePublicKeyFromSecretKey;
const timeout = require('./utils/utils').timeout;
const generateKeyPairFromSecretKey = require('./utils/utils').generateKeyPairFromSecretKey;
const decodedHexAddressToPublicAddress = require('./utils/utils').decodedHexAddressToPublicAddress;
const readFileRelative = require('./utils/test-utils').readFileRelative;
const writeFileRelative = require('./utils/test-utils').writeFileRelative
const fileExists = require('./utils/test-utils').fileExists
const trimAdresseses = require('./utils/test-utils').trimAdresseses
const readFile = require('./utils/test-utils').readFile;


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
    decodedHexAddressToPublicAddress,
    readFile,
	readFileRelative,
	writeFileRelative,
	fileExists,
	trimAdresseses
}