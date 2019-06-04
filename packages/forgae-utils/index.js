const loggerUtils = require('./utils/logger-utils');
const printReportTable = loggerUtils.printReportTable;
const getReadableStatus = loggerUtils.getReadableStatus;

const fsUtils = require('./utils/fs-utils');
const print = fsUtils.print;
const printError = fsUtils.printError;
const createMissingFolder = fsUtils.createMissingFolder;
const copyFileOrDir = fsUtils.copyFileOrDir;
const getFiles = fsUtils.getFiles;
const readFileRelative = fsUtils.readFileRelative;
const writeFileRelative = fsUtils.writeFileRelative;
const fileExists = fsUtils.fileExists;
const readFile = fsUtils.readFile;
const deleteCreatedFiles = fsUtils.deleteCreatedFiles;

const forgaeUtils = require('./utils/forgae-utils');
const getClient = forgaeUtils.getClient;
const getNetwork = forgaeUtils.getNetwork;
const sleep = forgaeUtils.sleep;
const execute = forgaeUtils.execute;
const forgaeExecute = forgaeUtils.forgaeExecute;
const config = forgaeUtils.config;
const handleApiError = forgaeUtils.handleApiError;
const logApiError = forgaeUtils.logApiError;
const timeout = forgaeUtils.timeout;

const contractUtils = require('./utils/contract-utils');
const keyToHex = contractUtils.keyToHex;
const isKeyPair = contractUtils.isKeyPair;
const generatePublicKeyFromSecretKey = contractUtils.generatePublicKeyFromSecretKey;
const generateKeyPairFromSecretKey = contractUtils.generateKeyPairFromSecretKey;
const decodedHexAddressToPublicAddress = contractUtils.decodedHexAddressToPublicAddress;
const trimAdresseses = contractUtils.trimAdresseses;

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
    deleteCreatedFiles,
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
