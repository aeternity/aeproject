const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const fs = require('fs-extra');
const assert = chai.assert;
const execute = require('../../packages/aeproject-utils/utils/aeproject-utils.js').aeprojectExecute;
const timeout = require('../../packages/aeproject-utils/utils/aeproject-utils.js').timeout;
const constants = require('../constants.json');
const contractsConstants = require('../../packages/aeproject-cli/aeproject-contracts/contracts-constants.json');
const {
    spawn
} = require('promisify-child-process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

let executeOptions = {
    cwd: process.cwd() + constants.testTestsFolderPath
};

describe('AEproject contracts', () => {
    let contractsResult;
    let projectDir;
    let testFolderDir;
    let fullPath

    before(async function () {
        fs.ensureDirSync(`.${ constants.testTestsFolderPath }`);
        await execute(constants.cliCommands.INIT, [], executeOptions);
        await execute(constants.cliCommands.NODE, [], executeOptions);

        projectDir = process.cwd();
        testFolderDir = constants.testTestsFolderPath;
        fullPath = path.join(projectDir, testFolderDir);

        process.chdir(fullPath);
    });

    it('should execute contracts cli command correctly', async function () {
        const logStream = fs.createWriteStream(contractsConstants.LOG_FILE, {
            flags: 'a'
        });
        contractsResult = spawn(contractsConstants.AEPROJECT_CLI_COMMAND, [constants.cliCommands.CONTRACTS, constants.cliCommandsOptions.IGNORE_OPENING], {});
        contractsResult.stdout.pipe(logStream);
        await timeout(contractsConstants.STARTING_AEPP_TIMEOUT);
        const logContent = fs.readFileSync(contractsConstants.LOG_FILE, 'utf8');
        assert.include(logContent, contractsConstants.LOCALHOST_SUCCESS);
        fs.removeSync(contractsConstants.LOG_FILE);
    });

    it('should execute contracts cli command with update parameter correctly', async function () {
        const logStream = fs.createWriteStream(contractsConstants.LOG_FILE, {
            flags: 'a'
        });
        contractsResult = spawn(contractsConstants.AEPROJECT_CLI_COMMAND, [
            constants.cliCommands.CONTRACTS,
            constants.cliCommandsOptions.UPDATE,
            constants.cliCommandsOptions.IGNORE_OPENING
        ], {});
        contractsResult.stdout.pipe(logStream);
        await timeout(contractsConstants.STARTING_AEPP_TIMEOUT);
        const logContent = fs.readFileSync(contractsConstants.LOG_FILE, 'utf8');
        assert.include(logContent, contractsConstants.UPDATE_FLAG_CHECK_CONDITION);
        assert.include(logContent, contractsConstants.LOCALHOST_SUCCESS);
        fs.removeSync(contractsConstants.LOG_FILE);
    });

    it('should connect the contracts aepp to the specified nodeUrl', async function () {
        const logStream = fs.createWriteStream(contractsConstants.LOG_FILE, {
            flags: 'a'
        });
        contractsResult = spawn(contractsConstants.AEPROJECT_CLI_COMMAND, [
            constants.cliCommands.CONTRACTS,
            constants.cliCommandsOptions.NODE_URL,
            contractsConstants.SPECIFIC_LOCAL_NODE_URL,
            constants.cliCommandsOptions.IGNORE_OPENING
        ], {});

        contractsResult.stdout.pipe(logStream);
        await timeout(contractsConstants.STARTING_AEPP_TIMEOUT);
        const logContent = fs.readFileSync(contractsConstants.LOG_FILE, 'utf8');

        assert.include(logContent, contractsConstants.SPECIFIC_LOCAL_NODE_URL);
        assert.include(logContent, contractsConstants.LOCALHOST_SUCCESS);
        fs.removeSync(contractsConstants.LOG_FILE);
    });

    after(async function () {
        process.chdir(projectDir);

        await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions);
        fs.removeSync(`.${ constants.testTestsFolderPath }`);
        await exec('kill $(lsof -t -i:8080)');
    })
});