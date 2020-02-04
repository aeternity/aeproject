const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs-extra');
const path = require('path');
const open = require('open');
const {
    spawn
} = require('promisify-child-process');

const prompt = require('aeproject-utils').prompt;

const contractsConstants = require('./contracts-constants.json');

let nodeModulesPath;
let contractAeppProjectPath;

const run = async (options) => {
    await installYarn();
    await mainFlow(options);
};

const installYarn = async () => {
    let isYarnInstalled = false;
    try {
        await exec('yarn --version');
        isYarnInstalled = true;
    } catch (error) {
        // yarn not found...
    }

    if (!isYarnInstalled) {
        // await exec('npm install -g yarn@berry'); // npm uninstall -g yarn@berry
        // await prompt('Yarn not found! Contracts depends on it. Do you want to install "yarn"?', exec, 'npm install -g yarn@berry');
        await prompt('Yarn not found! Contracts depends on it. Do you want to install "yarn"?', exec, 'brew install yarn'); // brew install yarn
    }
}

const mainFlow = async (options) => {
    exec('npm list -g --depth 0', async function (error, stdout) {

        const contractsAeppInstalled = await checkGlobalModuleExistence(stdout, contractsConstants.CONTRACTS_AEPP_LITERAL);

        if (!contractsAeppInstalled || options.update) {
            await installRepo();
        }

        await resolveFreshlyInstalledContractsAeppPath();

        await serveContractsAepp(options);
    });
};

const checkGlobalModuleExistence = async (stdout, moduleName) => {
    const devDependenciesPath = stdout.split('\n')[0];
    nodeModulesPath = path.join(devDependenciesPath, contractsConstants.NODE_MODULES_LITERAL);
    const modulesContent = fs.readdirSync(nodeModulesPath);

    let yarnNodeModulePath = await getYarnNodeModulePath();
    let tempCwd = process.cwd();
    process.chdir(yarnNodeModulePath);

    let yarnLS = await exec('ls');
    let isContractsInstalled = yarnLS.stdout.split('\n').indexOf('contracts-aepp') >= 0;
    process.chdir(tempCwd);

    return modulesContent.includes(moduleName) || isContractsInstalled;
};

const installRepo = async () => {
    const currentPath = process.cwd();
    console.log('====== Installing Contracts web Aepp ======');

    await exec(`yarn global add ${ contractsConstants.CONTRACTS_AEPP_GITHUB_URL }`);
    process.chdir(path.resolve(await getYarnNodeModulePath(), 'contracts-aepp'))
    await exec('yarn');

    process.chdir(currentPath);
};

const serveContractsAepp = async (options) => {
    console.log('====== Starting Contracts web Aepp ======');
    console.log(2, process.cwd());
    let yarnGlobalDir = await exec('yarn global dir');
    let contractAeppPath = path.resolve(yarnGlobalDir.stdout.replace('\n', ''), './node_modules/contracts-aepp');

    const currentDir = process.cwd();
    // process.chdir(contractAeppProjectPath);
    process.chdir(contractAeppPath);
    updateSettingsFile(options, currentDir);
    configureSettings(currentDir);

    const startingAeppProcess = spawn('yarn', ['run', 'start:dev']);

    startingAeppProcess.stdout.on('data', (data) => {
        if (data.toString().includes(contractsConstants.CONTRACTS_STARTING_SUCCESSFULLY)) {
            console.log(`====== Contracts web Aepp is running on ${ contractsConstants.DEFAULT_CONTRACTS_AEPP_URL } ======`);
            console.log(`====== The Aepp will connect to the spawned local node on ${ options.nodeUrl ? options.nodeUrl : contractsConstants.DEFAULT_LOCAL_NODE_URL } ======`);
            console.log('====== Please install browser extension which allows CORS. (Access-Control-Allow-Origin to perform cross-domain requests in the web application) ======');

            if (options.ignorebrowser) {
                return;
            }

            open(contractsConstants.DEFAULT_CONTRACTS_AEPP_URL);
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
            if (error) {
                resolve(false)
            }

            const contractsAeppIsInstalled = checkGlobalModuleExistence(stdout, contractsConstants.CONTRACTS_AEPP_LITERAL);
            if (contractsAeppIsInstalled) {
                contractAeppProjectPath = path.join(nodeModulesPath, contractsConstants.CONTRACTS_AEPP_LITERAL);
                resolve(true);
            }

            resolve(false);
        });
    })
};

const getYarnNodeModulePath = async () => {
    let yarnGlobalDir = await exec('yarn global dir');
    console.log('yarnGlobalDir.stdout', yarnGlobalDir.stdout);

    let temp = process.cwd(); // printenv
    console.log('---------');
    // console.log(await exec('printenv'));
    // process.chdir(yarnGlobalDir.stdout.replace('\n', ''))
    process.chdir('/home/travis/.yarn/bin')
    console.log(await exec('ls -l'));

    process.chdir(temp);
    return path.resolve(yarnGlobalDir.stdout.replace('\n', ''), './node_modules');
}

module.exports = {
    run
};