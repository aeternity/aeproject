const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const assert = chai.assert;

const cliUtils = require('../../packages/aeproject-utils/utils/aeproject-utils.js');
const execute = cliUtils.aeprojectExecute;
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const _store = require('../../packages/aeproject-logger/logger-service/log-store-service')

const constants = require('../constants.json');
const TEMP_TEST_PATH = constants.historyTestsFolderPath;
const PATH_TO_STORE_DIRECTORY = '.aeproject-store';

const deployerPublicKey = 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU';

const invalidParamDeploymentScriptPath = 'deployment/deploy2.js';
const missingParamDeploymentScriptPath = 'deployment/deploy3.js';
const additionalSCPath = 'contracts/ExampleContract2.aes';

function insertAdditionalFiles (oldCWD) {

    // copy needed files into test folder to run the specific tests
    let cwd = process.cwd();

    let testFolder = path.join(oldCWD, TEMP_TEST_PATH);

    process.chdir(oldCWD)

    const invalidParamDeploymentScript = './test/commands-tests/artifacts/deploy-template-invalid-init-param.jsss';
    const missingParamDeploymentScript = './test/commands-tests/artifacts/deploy-template-missing-init-param.jsss';
    const additionalSC = './test/commands-tests/multipleContractsFolder/ExampleContract5.aes';

    fs.copyFileSync(invalidParamDeploymentScript, `${ testFolder }/${ invalidParamDeploymentScriptPath }`);
    fs.copyFileSync(missingParamDeploymentScript, `${ testFolder }/${ missingParamDeploymentScriptPath }`);
    fs.copyFileSync(additionalSC, `${ testFolder }/${ additionalSCPath }`);

    process.chdir(cwd);
}

function countHistoryLogs (result) {
    let counter = 0;
    let hasMatch = true;
    let index = 0;

    if (!result) {
        return counter;
    }

    while (hasMatch) {
        index = result.indexOf('Event Time', index);
        if (index < 0) {
            hasMatch = false;
        } else {
            index++;
            counter++;
        }
    }

    return counter;
}

describe('AEproject History', async () => {

    describe('Log store service tests', () => {

        const now = Date.now();
        const deployerType = 'Deployer Type';
        const label = 'Label Name';
        const transactionHash = '0x00'
        const status = 1;
        const result = 'Result of the transaction'
        const networkId = "ae_devnet"

        const actionInfo = {
            deployerType,
            nameOrLabel: label,
            transactionHash,
            status: status === 1,
            result,
            gasPrice: 1,
            gasUsed: 1,
            networkId: "ae_devnet",
            publicKey: deployerPublicKey
        }

        let store;

        beforeEach(() => {
            let storeConstructor = _store.constructor;
            store = new storeConstructor()
        });

        it('should initialize the store', () => {
            let result = store.initHistoryRecord();
            let history = store.getHistory();

            assert(result, "It's not initialized correct!");
            assert(store._historyStore.path.endsWith('.aeproject-store/.history.json'), 'Incorrect path');
            assert(store._HISTORY_ID == ('' + (history.length - 1)), "Incorrect Id");
        });

        it('[NEGATIVE] Store should NOT be initialized', () => {
            let isInitialize = store.isInitied;

            assert(!isInitialize, "It's initialized!");
        });

        it('should initialize logs correctly', () => {
            store.initHistoryRecord();

            const currentRecord = store.getCurrentWorkingRecord();
            assert(Array.isArray(currentRecord.actions), 'The last record actions is not array');
        });

        it('[NEGATIVE] store is not initialized, should NOT have any records', () => {
            const currentRecord = store.getCurrentWorkingRecord();
            assert(!currentRecord, 'Store is initialized or has some record!');
        });

        it('should log actions correctly', () => {
            store.initHistoryRecord();

            store.logAction(actionInfo);

            const lastRecord = store.getLastWorkingRecord();
            const lastAction = lastRecord.actions[lastRecord.actions.length - 1];

            assert(lastAction.deployerType == deployerType, 'Deployer Type not set correctly');
            assert(lastAction.nameOrLabel == label, 'Label not set correctly');
            assert(lastAction.transactionHash == transactionHash, 'Transaction hash not set correctly');
            assert(lastAction.status == status, 'status not set correctly');
            assert(lastAction.eventTimestamp >= now, 'timestamp set was not correct');
            assert(lastAction.publicKey === deployerPublicKey, 'Public key not set correctly');

            const currentRecord = store.getLastWorkingRecord();
            const currentAction = currentRecord.actions[currentRecord.actions.length - 1];

            assert(currentAction.deployerType == deployerType, 'Deployer Type not set correctly');
            assert(currentAction.nameOrLabel == label, 'Label not set correctly');
            assert(currentAction.transactionHash == transactionHash, 'Transaction hash not set correctly');
            assert(currentAction.status == status, 'status not set correctly');
            assert(currentAction.eventTimestamp >= now, 'timestamp set was not correct');
            assert(currentAction.networkId === networkId, "The network id is not set correctly")
        });

        it('[NEGATIVE] should not log if log store service is not inited', () => {

            store.logAction(actionInfo);

            let lastRecord = store.getCurrentWorkingRecord();
            assert.notOk(lastRecord, "There is a record!")
        });

        afterEach(async () => {
            fsExtra.removeSync(path.resolve(process.cwd(), PATH_TO_STORE_DIRECTORY));
        });

    });

    describe('History', async () => {
        let currentCwd;
        let tempTestPath = path.join(process.cwd(), TEMP_TEST_PATH);

        before(async () => {
            if (!fs.existsSync(tempTestPath)) {
                fs.mkdirSync(tempTestPath);
            }

            currentCwd = process.cwd();
            process.chdir(tempTestPath);

            await execute(constants.cliCommands.INIT, []);
            await execute(constants.cliCommands.NODE, ['--start']);
        });

        it('History should be empty', async () => {

            let result = await execute(constants.cliCommands.HISTORY, []);
            let numberOfLogs = countHistoryLogs(result);

            assert.equal(numberOfLogs, 0, "There are some logs!");
        });

        it('After first deployment, history should return 1 record', async () => {

            await execute(constants.cliCommands.DEPLOY, []);
            let result = await execute(constants.cliCommands.HISTORY, []);
            let numberOfLogs = countHistoryLogs(result);

            assert.equal(numberOfLogs, 1, "There are some logs!");
        });

        it('After 3 deployments, history should return 3 records', async () => {

            for (let i = 0; i < 2; i++) {
                await execute(constants.cliCommands.DEPLOY, []);
            }

            let result = await execute(constants.cliCommands.HISTORY, []);
            let numberOfLogs = countHistoryLogs(result);

            // !!! => 2 records from this test and 1 from previous
            assert.equal(numberOfLogs, 3, "Incorrect number of logs!");
        });

        it('History should return 5(default limit) records', async () => {
            for (let i = 0; i < 12; i++) {
                await execute(constants.cliCommands.DEPLOY, []);
            }

            let result = await execute(constants.cliCommands.HISTORY, []);
            let numberOfLogs = countHistoryLogs(result);

            assert.equal(numberOfLogs, 5, "Incorrect number of logs!");
        });

        it('History should return 10 records, test --limit parameter', async () => {
            let numberOfExpectedLogs = 10;
            let result = await execute(constants.cliCommands.HISTORY, ['--limit', numberOfExpectedLogs]);
            let numberOfLogs = countHistoryLogs(result);

            assert.equal(numberOfLogs, numberOfExpectedLogs, "Incorrect number of logs!");
        });

        after(async () => {

            await execute(constants.cliCommands.NODE, ['--stop']);

            fsExtra.removeSync(tempTestPath);
            process.chdir(currentCwd);
        });
    });

    describe('History - test deployment failures', async () => {
        let currentCwd;
        let tempTestPath = path.join(process.cwd(), TEMP_TEST_PATH);

        beforeEach('', async () => {
            if (!fs.existsSync(tempTestPath)) {
                fs.mkdirSync(tempTestPath);
            }

            currentCwd = process.cwd();
            process.chdir(tempTestPath);

            await execute(constants.cliCommands.INIT, []);
            await execute(constants.cliCommands.NODE, ['--start']);
        });

        it('log should have additional info like error, init state and options', async () => {

            insertAdditionalFiles(currentCwd);

            await execute(constants.cliCommands.DEPLOY, [
                "--path",
                `${ invalidParamDeploymentScriptPath }`
            ]);

            let result = await execute(constants.cliCommands.HISTORY, []);

            let hasFail = result.indexOf('│ Status        │ Fail   ') > 0;
            let hasError = result.indexOf('│ Error         │') > 0;
            let hasInitState = result.indexOf('│ Init State    │') > 0;
            let hasOptions = result.indexOf('│ Options       │') > 0;

            assert.isOk(hasFail && hasError && hasInitState && hasOptions, 'Missing additional error info!');
        });

        it('With invalid init state, log should be unsuccessful and should has an error', async () => {

            insertAdditionalFiles(currentCwd);

            await execute(constants.cliCommands.DEPLOY, [
                "--path",
                `${ invalidParamDeploymentScriptPath }`
            ]);

            let result = await execute(constants.cliCommands.HISTORY, []);

            let hasFail = result.indexOf('│ Status        │ Fail   ') > 0;
            let hasError = result.indexOf('│ Error') > 0;

            assert.isOk(hasFail && hasError, 'History log is not correct!');
        });

        it('With missing init state, log should be unsuccessful and should has an error', async () => {

            insertAdditionalFiles(currentCwd);

            await execute(constants.cliCommands.DEPLOY, [
                "--path",
                `${ missingParamDeploymentScriptPath }`
            ]);

            let result = await execute(constants.cliCommands.HISTORY, []);

            let hasFail = result.indexOf('│ Status        │ Fail   ') > 0;
            let hasError = result.indexOf('│ Error') > 0;

            assert.isOk(hasFail && hasError, 'History log is not correct!');
        });

        afterEach(async () => {

            await execute(constants.cliCommands.NODE, ['--stop']);

            fsExtra.removeSync(tempTestPath);
            process.chdir(currentCwd);
        });
    });
});