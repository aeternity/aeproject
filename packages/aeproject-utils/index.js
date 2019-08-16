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
const createDirIfNotExists = fsUtils.createDirIfNotExists;
const writeFileSync = fsUtils.writeFile;

const aeprojectUtils = require('./utils/aeproject-utils');
const getClient = aeprojectUtils.getClient;
const getNetwork = aeprojectUtils.getNetwork;
const sleep = aeprojectUtils.sleep;
const execute = aeprojectUtils.execute;
const aeprojectExecute = aeprojectUtils.aeprojectExecute;
const config = aeprojectUtils.config;
const handleApiError = aeprojectUtils.handleApiError;
const logApiError = aeprojectUtils.logApiError;
const timeout = aeprojectUtils.timeout;
const contractCompile = aeprojectUtils.contractCompile;
const checkNestedProperty = aeprojectUtils.checkNestedProperty;
const winExec = aeprojectUtils.winExec;
const waitForContainer = aeprojectUtils.waitForContainer;

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
    aeprojectExecute,
    isKeyPair,
    generatePublicKeyFromSecretKey,
    generateKeyPairFromSecretKey,
    decodedHexAddressToPublicAddress,
    readFileRelative,
    writeFileRelative,
    fileExists,
    trimAdresseses,
    SophiaUtil,
    contractCompile,
    checkNestedProperty,
    createDirIfNotExists,
    writeFileSync,
    winExec,
    waitForContainer
}
