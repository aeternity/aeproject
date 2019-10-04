const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const fs = require('fs-extra')
const assert = chai.assert;
const execute = require('../../packages/aeproject-utils/utils/aeproject-utils.js').aeprojectExecute;
const test = require('../../packages/aeproject-cli/aeproject-test/test')
const sinon = require('sinon')
const constants = require('./../constants.json')
const countPhraseRepeats = require('./../utils').countPhraseRepeats;

const path = require('path');

var shell = require('shelljs');

let executeOptions = {
    cwd: process.cwd() + constants.testTestsFolderPath
};

describe('AEproject Test', () => {

    describe('AEproject Test - js tests', () => {

        before(async function () {
            fs.ensureDirSync(`.${ constants.testTestsFolderPath }`)
            await execute(constants.cliCommands.INIT, [], executeOptions)
            await execute(constants.cliCommands.NODE, [], executeOptions)
        })

        it('should work on unexisting test folder', async function () {
            await assert.isFulfilled(test.run(constants.testTestsFolderPath))
        })

        it('shоuld throw on wrong path', async function () {
            await assert.isRejected(test.run('wrongTestDirectory'));

        });
        // TODO: Sinon test should be reworked with the new node version 
        xit('should execute test cli command with specific path', async function () {

            let aeprojectTestSpy = sinon.spy(test, "run")
            var version = await shell.exec(`aeproject test --path ${ executeOptions }/exampleTests.js`, {
                silent: false,
                async: true
            });

            sinon.assert.calledOnce(aeprojectTestSpy);
            aeprojectTestSpy.restore();
        });

        xit('should execute test cli command without specific js file', async function () {
            let etherlimeTestSpy = sinon.spy(etherlimeTest, "run")
            await assert.isFulfilled(test.run())
            sinon.assert.calledWith(etherlimeTestSpy, calledArgs)
            etherlimeTestSpy.restore();
        });

        after(async function () {
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
            fs.removeSync(`.${ constants.testTestsFolderPath }`);
        })
    })

    describe('AEproject Test - sophia tests', () => {

        before(async function () {
            fs.ensureDirSync(`.${ constants.testTestsFolderPath }`);
            await execute(constants.cliCommands.INIT, [], executeOptions);
            await execute(constants.cliCommands.NODE, [], executeOptions)
        })

        beforeEach(async function () {
            fs.ensureDirSync(`.${ constants.testTestsFolderPath }`);
            await execute(constants.cliCommands.INIT, [], executeOptions);
        });

        it('should parse sophia tests, create regular js file with tests and execute it.', async function () {
            await insertAdditionalFiles(executeOptions.cwd);
            let result = await execute(constants.cliCommands.TEST, [], executeOptions);
            let indexOfSophiaTests = result.indexOf('Sophia tests');
            if (indexOfSophiaTests <= 0) {
                assert.isOk(false, "Missing sophia tests");
            }

            let shouldHaveSuccessfulTest = result.indexOf('1 passing', indexOfSophiaTests) > 0;
            let shouldHaveUnsuccessfulTest = result.indexOf('1 failing', indexOfSophiaTests) > 0;

            assert.isOk(shouldHaveSuccessfulTest && shouldHaveUnsuccessfulTest, "Tests have unexpected results.");
        })

        it('Should not create regular JS test file, sophia tests and smart contract does not have equal contract "Name"', async () => {
            insertAdditionalFiles(executeOptions.cwd, true);

            let result = await execute(constants.cliCommands.TEST, [
                '--path',
                constants.testTestsFolderPath
            ], executeOptions);

            if (result.indexOf('Cannot append sophia tests to existing contract!') < 0) {
                assert.isOk(false, "Sophia tests were appended to invalid smart contract!");
            }
        })

        it('should run only "sophia test"', async function () {
            insertAdditionalFiles(executeOptions.cwd);
            let result = await execute(constants.cliCommands.TEST, [
                '--path',
                '/test/calculator-tests.aes'
            ], executeOptions);

            let count = countPhraseRepeats(result, '===== Starting Tests =====');

            assert.isOk(count === 1, "More than one file with tests were executed!");
            assert.isOk(result.indexOf('Sophia tests') >= 0, "Missing sophia tests!");
        })

        afterEach(async function () {
            fs.removeSync(`.${ constants.testTestsFolderPath }`);
        })

        after(async function () {
            // this folder structure is needed for NODE --STOP command
            fs.ensureDirSync(`.${ constants.testTestsFolderPath }`);
            await execute(constants.cliCommands.INIT, [], executeOptions);

            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions);
            fs.removeSync(`.${ constants.testTestsFolderPath }`);
        })
    })

    async function insertAdditionalFiles (cwd, copyArtifactsWithInvalidData = false) {
        const contractDestinationFolder = `${ cwd }/contracts`;
        const testDestinationFolder = `${ cwd }/test`;

        const calculatorSourcePath = path.resolve(cwd, './../artifacts/calculator.aes');
        const sophiaTestSourcePath = path.resolve(cwd, './../artifacts/calculator-tests.aes');

        const calculatorWithInvalidNameSourcePath = path.resolve(cwd, './../artifacts/calculator-invalid-name.aes');
        const sophiaTestWithInvalidNameSourcePath = path.resolve(cwd, './../artifacts/calculator-tests-invalid-contract-name.aes');

        if (!copyArtifactsWithInvalidData) {
            fs.copyFileSync(calculatorSourcePath, `${ contractDestinationFolder }/calculator.aes`);
            fs.copyFileSync(sophiaTestSourcePath, `${ testDestinationFolder }/calculator-tests.aes`);
        } else {
            fs.copyFileSync(calculatorWithInvalidNameSourcePath, `${ contractDestinationFolder }/calculator-invalid-name.aes`);
            fs.copyFileSync(sophiaTestWithInvalidNameSourcePath, `${ testDestinationFolder }/calculator-tests-invalid-contract-name.aes`);
        }
    }
})