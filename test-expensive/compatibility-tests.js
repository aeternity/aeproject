const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
chai.use(chaiFiles);

const fs = require('fs-extra');
const execute = require('../packages/aeproject-utils/utils/aeproject-utils.js').aeprojectExecute;
const path = require('path');

const {
    exec,
    spawn
} = require('promisify-child-process');

const constants = require('../test/constants.json');
const testFolder = constants.compatibilityTestFolder;
const cliCommands = constants.cliCommands;
const cliCmdOptions = constants.cliCommandsOptions;

const aeConfig = require('aeproject-config');
const nodeConfig = aeConfig.nodeConfiguration;
const compilerConfig = aeConfig.compilerConfiguration;

let executeOptions = {
    cwd: process.cwd() + testFolder
};

const compatibilityCmd = (options) => {
    return new Promise((resolve, reject) => {
        let cmd = `${ cliCommands.AEPROJECT } ${ cliCommands.COMPATIBILITY }`;
        if (options && options.nodeVersion) {
            cmd += ` ${ cliCmdOptions.NODE_VERSION } ${ options.nodeVersion }`;
        }

        if (options && options.compilerVersion) {
            cmd += ` ${ cliCmdOptions.COMPILER_VERSION } ${ options.compilerVersion }`;
        }

        let result = '';
        let log = '';

        let temp = exec(cmd, executeOptions);
        if (temp.stdout) {
            temp.stdout.on('data', async (data) => {
                let str = data.toString('utf8');
                log += str;
                if (str.trim() == 'Running tests...') {
                    result = await exec(cliCommands.DOCKER_PS);
                    if (result.stdout) {
                        result = result.stdout;
                    }
                }
            });
        }

        if (temp.stderr) {
            temp.stderr.on('data', (data) => {
                console.log('err:', data.toString('utf8'));
            });
        }

        temp.on('exit', (code) => {
            if (code !== 0) {
                const msg = `Child process exited with code ${ code }`;
                console.log(msg);
                reject(msg)
            }
            
            if (options && options.logs) {
                resolve(log);
            } else {
                resolve(result);
            }
        });
    });
}

describe('Compatibility tests', async function () {
    let tempCWD = process.cwd();

    before(async function () {
        fs.ensureDirSync(`.${ testFolder }`);
        await execute(constants.cliCommands.INIT, [], executeOptions);
        process.chdir(executeOptions.cwd);
    })

    it('Docker images should be run with "latest" versions', async function () {
        let result = await compatibilityCmd();

        const isNodeLatestVersion = result.indexOf(`${ nodeConfig.dockerImage }:latest`) >= 0;
        const isCompilerLatestVersion = result.indexOf(`${ compilerConfig.dockerImage }:latest`) >= 0;

        assert.isOk(isNodeLatestVersion && isCompilerLatestVersion, 'Node is not running with latest version');
        assert.isOk(isCompilerLatestVersion, 'Compiler is not running with latest version');
        
    })

    it('Docker images should be run with "specific" versions', async function () {
        const nodeVersion = 'v5.1.0';
        const compilerVersion = 'v3.1.0';
        
        let result = await compatibilityCmd({ nodeVersion: nodeVersion, compilerVersion: compilerVersion });
        const isNodeLatestVersion = result.indexOf(`${ nodeConfig.dockerImage }:${ nodeVersion }`) >= 0;
        const isCompilerLatestVersion = result.indexOf(`${ compilerConfig.dockerImage }:${ compilerVersion }`) >= 0;

        assert.isOk(isNodeLatestVersion && isCompilerLatestVersion, 'Node is not running with specific version');
        assert.isOk(isCompilerLatestVersion, 'Compiler is not running with specific version');
    })

    it('Tests should be run successfully and should stop node and compiler', async function () {
        let result = await compatibilityCmd({ logs: true });

        const isTestsStarted = result.indexOf('Starting Tests');
        const isContractDeployed = result.indexOf('has been deployed');

        assert.isOk(isTestsStarted && isContractDeployed);

        let dockerPSResult = await exec(cliCommands.DOCKER_PS);
        const isNodeRunning = dockerPSResult.stdout.indexOf(nodeConfig.dockerImage) >= 0;
        const isCompilerRunning = dockerPSResult.stdout.indexOf(compilerConfig.dockerImage) >= 0;

        assert.isNotOk(isNodeRunning || isCompilerRunning, 'Node or Compiler is running');
    })

    it('Test "compatibility" with invalid VM', async () => {

        fs.copySync(path.resolve(__dirname, '../test/commands-tests/artifacts/crypto-hamster-broken-tests.jss'), path.join(process.cwd(), './test/exampleTest.js'), { overwrite: true });
        let result = await compatibilityCmd({ logs: true });
        console.log(JSON.stringify(result));
        let isVMNotSupported = result.indexOf('VM VERSION 4 do not support by this node') >= 0;
        assert.isOk(isVMNotSupported, "invalid VM was not triggered");
    })

    it('Test "compatibility", Node do not support syntax', async () => {

        fs.copySync(path.resolve(__dirname, '../test/commands-tests/artifacts/token-migration.aes'), path.join(process.cwd(), './contracts/ExampleContract.aes'), { overwrite: true });
        fs.copySync(path.resolve(__dirname, '../test/commands-tests/artifacts/token-migration-tests.jss'), path.join(process.cwd(), './test/exampleTest.js'), { overwrite: true });
        
        let result = await compatibilityCmd({ nodeVersion: 'v3.3.0', logs: true });
        console.log(JSON.stringify(result));
        let isTransactionStuck = result.indexOf('Giving up after 10 blocks mined') >= 0;
        assert.isOk(isTransactionStuck, "Transaction was mined");
    })

    after(async function () {
        process.chdir(tempCWD);
        fs.removeSync(`.${ testFolder }`);
    })
})
