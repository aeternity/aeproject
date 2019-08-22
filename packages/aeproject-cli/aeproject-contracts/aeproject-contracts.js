const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs-extra');
const path = require('path');
const opn = require('opn');
const {
    spawn
} = require('promisify-child-process');

const contractsConstants = require('./contracts-constants.json');

let nodeModulesPath;
let contractAeppProjectPath;

const run = async (options) => {
    await mainFlow(options);
};

const mainFlow = async (options) => {
    exec('npm list -g --depth 0', async function (error, stdout) {
        const contractsAeppInstalled = checkGlobalModuleExistence(stdout, contractsConstants.CONTRACTS_AEPP_LITERAL);

        if (!contractsAeppInstalled || options.update) {
            await installRepo();
        }

        await resolveFreshlyInstalledContractsAeppPath();

        await serveContractsAepp(options);
    });
};

const checkGlobalModuleExistence = (stdout, moduleName) => {
    const devDependenciesPath = stdout.split('\n')[0];
    nodeModulesPath = path.join(devDependenciesPath, contractsConstants.NODE_MODULES_LITERAL);
    const modulesContent = fs.readdirSync(nodeModulesPath);
    return modulesContent.includes(moduleName);
};

const installRepo = async () => {
    console.log('====== Installing Contracts web Aepp ======');
    await exec(`npm install -g ${ contractsConstants.CONTRACTS_AEPP_GITHUB_URL }`);
};

const serveContractsAepp = async (options) => {
    console.log('====== Starting Contracts web Aepp ======');
    const currentDir = process.cwd();
    process.chdir(contractAeppProjectPath);

    updateSettingsFile(options, currentDir);
    configureSettings(currentDir);

    await exec(`yarn install`);

    const startingAeppProcess = spawn('yarn', ['run', 'start:dev']);

    startingAeppProcess.stdout.on('data', (data) => {
        if (data.toString().includes(contractsConstants.CONTRACTS_STARTING_SUCCESSFULLY)) {
            console.log(`====== Contracts web Aepp is running on ${ contractsConstants.DEFAULT_CONTRACTS_AEPP_URL } ======`);
            console.log(`====== The Aepp will connect to the spawned local node on ${ options.nodeUrl ? options.nodeUrl : contractsConstants.DEFAULT_LOCAL_NODE_URL } ======`);
            console.log('====== Please install browser extension which allows CORS. (Access-Control-Allow-Origin to perform cross-domain requests in the web application) ======');

            if (options.ignoreOpenInBrowser) {
                return;
            }

            opn(contractsConstants.DEFAULT_CONTRACTS_AEPP_URL);
        }
    });

    process.chdir(currentDir);
};

const configureSettings = (currentDir) => {
    const contractsAeppDirectory = process.cwd();
    fs.copyFileSync(path.join(currentDir, contractsConstants.AEPROJECT_SETTINGS_PATH), path.join(contractsAeppDirectory, contractsConstants.CONTRACTS_SETTINGS_PATH));
};

const updateSettingsFile = (options, currentDir) => {
    const pathToAEprojectSettings = path.join(currentDir, contractsConstants.AEPROJECT_SETTINGS_PATH);
    const settingsObj = require(pathToAEprojectSettings);
    settingsObj.url = options.nodeUrl ? options.nodeUrl : contractsConstants.DEFAULT_LOCAL_NODE_URL;
    settingsObj.internalUrl = `${ options.nodeUrl ? options.nodeUrl : contractsConstants.DEFAULT_LOCAL_NODE_URL }/internal/`;
    const settingString = JSON.stringify(settingsObj);
    const replacementResult = `${ contractsConstants.EXPORT_FILE_LITERAL } ${ settingString }`;
    fs.writeFileSync(pathToAEprojectSettings, replacementResult);
};

const resolveFreshlyInstalledContractsAeppPath = () => {
    return new Promise((resolve, reject) => {
        exec('npm list -g --depth 0', async function (error, stdout) {
            const contractsAeppIsInstalled = checkGlobalModuleExistence(stdout, contractsConstants.CONTRACTS_AEPP_LITERAL);

            if (contractsAeppIsInstalled) {
                contractAeppProjectPath = path.join(nodeModulesPath, contractsConstants.CONTRACTS_AEPP_LITERAL);
                resolve();
            }
            reject();
        });
    })
};

module.exports = {
    run
};