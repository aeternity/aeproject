const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const fs = require('fs-extra')
const assert = chai.assert;
const utils = require('./../../cli-commands/utils');
const execute = utils.forgaeExecute;
const test = require('./../../cli-commands/forgae-test/test')
const sinon = require('sinon')
const constants = require('./../constants.json')

const path = require('path');

var shell = require('shelljs');

let executeOptions = {
    cwd: process.cwd() + constants.testTestsFolderPath
};

describe('ForgAE Test', () => {

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

        let forgaeTestSpy = sinon.spy(test, "run")
        var version = await shell.exec(`forgae test --path ${ executeOptions }/exampleTests.js`, {
            silent: false,
            async: true
        });

        sinon.assert.calledOnce(forgaeTestSpy);
        forgaeTestSpy.restore();
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

describe.only('ForgAE Test - sophia tests', () => {

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
        insertAdditionalFiles(executeOptions.cwd);
        let result = await execute(constants.cliCommands.TEST, [
            '--path',
            constants.testTestsFolderPath
        ], executeOptions);

        let indexOfSophiaTests = result.indexOf('Sophia tests');
        if (indexOfSophiaTests <= 0) {
            assert.isOk(false, "Missing sophia tests");
        }

        let shouldHaveSuccessfulTest = result.indexOf('1 passing', indexOfSophiaTests) > 0;
        let shouldHaveUnsuccessfulTest = result.indexOf('1 failing', indexOfSophiaTests) > 0;
        
        assert.isOk(shouldHaveSuccessfulTest && shouldHaveUnsuccessfulTest, "Tests have unexpected results.");
    })

    it('check executed tests', async () => {
        insertAdditionalFiles(executeOptions.cwd, true);

        let result = await execute(constants.cliCommands.TEST, [
            '--path',
            constants.testTestsFolderPath
        ], executeOptions);

        if (result.indexOf('Error: Cannot append sophia tests to existing contract!') < 1) {
            assert.isOk(false, "Sophia tests were appended to invalid smart contract!");
        }
    })

    afterEach(async function () {
        fs.removeSync(`.${ constants.testTestsFolderPath }`);
    })

    after(async function () {
        await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions);
    })
})

function insertAdditionalFiles (cwd, copyArtifactsWithInvalidData = false) {
    // copy needed files into test folder to run the specific tests

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