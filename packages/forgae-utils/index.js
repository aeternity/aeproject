const printReportTable = require('./utils/logger-utils').printReportTable;
const getReadableStatus = require('./utils/logger-utils').getReadableStatus;

const print = require('./utils/fs-utils').print;
const printError = require('./utils/fs-utils').printError;
const createMissingFolder = require('./utils/fs-utils').createMissingFolder;
const copyFileOrDir = require('./utils/fs-utils').copyFileOrDir;
const getFiles = require('./utils/fs-utils').getFiles;
const readFileRelative = require('./utils/fs-utils').readFileRelative;
const writeFileRelative = require('./utils/fs-utils').writeFileRelative;
const fileExists = require('./utils/fs-utils').fileExists;
const readFile = require('./utils/fs-utils').readFile;

const getClient = require('./utils/forgae-utils').getClient;
const getNetwork = require('./utils/forgae-utils').getNetwork;
const sleep = require('./utils/forgae-utils').sleep;
const execute = require('./utils/forgae-utils').execute;
const forgaeExecute = require('./utils/forgae-utils').forgaeExecute;
const config = require('./utils/forgae-utils').config;
const handleApiError = require('./utils/forgae-utils').handleApiError;
const logApiError = require('./utils/forgae-utils').logApiError;
const timeout = require('./utils/forgae-utils').timeout;

const keyToHex = require('./utils/contract-utils').keyToHex;
const isKeyPair = require('./utils/contract-utils').isKeyPair;
const generatePublicKeyFromSecretKey = require('./utils/contract-utils').generatePublicKeyFromSecretKey;
const generateKeyPairFromSecretKey = require('./utils/contract-utils').generateKeyPairFromSecretKey;
const decodedHexAddressToPublicAddress = require('./utils/contract-utils').decodedHexAddressToPublicAddress;
const trimAdresseses = require('./utils/contract-utils').trimAdresseses;

const SophiaUtil = require('./utils/sophia-util');

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
    handleApiError,
    logApiError,
    timeout,
    keyToHex,
    forgaeExecute,
    isKeyPair,
    generatePublicKeyFromSecretKey,
    generateKeyPairFromSecretKey,
    decodedHexAddressToPublicAddress,
	readFileRelative,
	writeFileRelative,
	fileExists,
    trimAdresseses,
    SophiaUtil
}
