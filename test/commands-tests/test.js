const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const fs = require('fs-extra')
const assert = chai.assert;
const execute = require('../../packages/aeproject-utils/utils/aeproject-utils.js').aeprojectExecute;
const exec = require('../../packages/aeproject-utils/utils/aeproject-utils.js').execute;
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

    const nodeCWD = path.resolve(process.cwd(), constants.nodeDockerFilesFolderPath);
    const prevCWD = executeOptions.cwd;

    before(async function () {
        let dockerComposePath = path.join(process.cwd(), constants.folderPaths.dockerInitResourcesPath, constants.testsFiles.dockerComposeNodeYml)
        let dockerComposeCompilerPath = path.join(process.cwd(), constants.folderPaths.dockerInitResourcesPath, constants.testsFiles.dockerComposeCompilerYml)
        let dockerPath = path.join(process.cwd(), constants.folderPaths.dockerInitResourcesPath, '/docker')

        fs.ensureDirSync(nodeCWD);
        fs.copyFileSync(dockerComposePath, `${ nodeCWD }${ constants.testsFiles.dockerComposeNodeYml }`);
        fs.copyFileSync(dockerComposeCompilerPath, `${ nodeCWD }${ constants.testsFiles.dockerComposeCompilerYml }`);
        fs.copySync(dockerPath, `${ nodeCWD }/docker`);

        executeOptions.cwd = nodeCWD
        await execute(constants.cliCommands.ENV, [], executeOptions);
        executeOptions.cwd = prevCWD;
    })

    describe('AEproject Test - js tests', () => {

        before(async function () {
            fs.ensureDirSync(`.${ constants.testTestsFolderPath }`)
            await execute(constants.cliCommands.INIT, [], executeOptions)
        })

        it('should work on existing test folder', async function () {
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

        after(function () {
            fs.removeSync(path.join(process.cwd(), `.${ constants.testTestsFolderPath }`));
        })
    })

    describe('AEproject Test - sophia tests', () => {

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

    describe('AEproject Test - test "test" command', () => {

        const expectedResultFromTestCommand = '"npm run test" command successfully execute exampleTest.js file';
        const expectedResultFromAeTestCommand = '"npm run aetest" command successfully execute exampleTest.js file';

        const testFilePath = path.join(process.cwd(), `.${ constants.testTestsFolderPath }`, `/test/exampleTest.js`);

        function replaceContentOfTestFile (content) {
            // change content in test.js file
            // command should find and execute tests/file
            fs.removeSync(testFilePath)
            fs.appendFileSync(testFilePath, `console.log('${ content }')`);
        }

        before(async function () {
            fs.ensureDirSync(`.${ constants.testTestsFolderPath }`)
            await execute(constants.cliCommands.INIT, [], executeOptions)
        })

        it('Should successfully execute "npm run test" command', async function () {
            replaceContentOfTestFile(expectedResultFromTestCommand)
            let result = await exec('npm', 'run', ['test'], executeOptions);
            await assert.isOk(result.indexOf(expectedResultFromTestCommand) >= 0);
        })

        it('Should successfully execute "npm run aetest" command', async function () {
            replaceContentOfTestFile(expectedResultFromAeTestCommand)
            let result = await exec('npm', 'run', ['aetest'], executeOptions);
            await assert.isOk(result.indexOf(expectedResultFromAeTestCommand) >= 0);
        })

        after(async function () {
            fs.removeSync(path.join(process.cwd(), `.${ constants.testTestsFolderPath }`));
        })
    })

    after(async function () {
        executeOptions.cwd = nodeCWD;
        await execute(constants.cliCommands.ENV, [constants.cliCommandsOptions.STOP], executeOptions);
        fs.removeSync(nodeCWD);
        executeOptions.cwd = prevCWD;
    })
})