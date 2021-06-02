const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const assert = chai.assert;
const execute = require('../../aeproject-utils/utils/aeproject-utils.js').aeprojectExecute;
const fs = require('fs-extra')
const path = require('path');
const constants = require('../constants.json')

const expectedCompileResultExampleContract = "ExampleContract.aes' has been successfully compiled."

let expectedResult1 = "ExampleContract1.aes' has been successfully compiled."
let expectedResult2 = "ExampleContract2.aes' has been successfully compiled."
let expectedResult3 = "ExampleContract3.aes' has been successfully compiled."
let expectedResult4 = "math.aes' has been successfully compiled."
let executeOptions = {
    cwd: process.cwd() + constants.compileTestsFolderPath
};
chai.use(chaiAsPromised);

const LOCAL_COMPILER_URL = constants.LOCAL_COMPILER_URL;
const INVALID_COMPILER_URL = 'https://compiler.somewhere.com';

describe('AEproject Compile', () => {
    before(async () => {
        fs.ensureDirSync(`.${ constants.compileTestsFolderPath }`)
        await execute(constants.cliCommands.INIT, [], executeOptions)
        await execute(constants.cliCommands.COMPILER, [], executeOptions)
    })

    describe('Compile', () => {
        it('Should compile contract successfully with specific contract path', async () => {
            let result = await execute(constants.cliCommands.COMPILE, [constants.cliCommandsOptions.PATH, `${ executeOptions.cwd }/contracts/ExampleContract.aes`])
            assert.include(result, expectedCompileResultExampleContract)
        })

        it('Should compile contract successfully without path', async () => {
            let result = await execute(constants.cliCommands.COMPILE, [], executeOptions)
            assert.include(result, expectedCompileResultExampleContract)
        })

        it('Should compile multiple contracts successfully with path', async () => {
            let result = await execute(constants.cliCommands.COMPILE, [constants.cliCommandsOptions.PATH, "../multipleContractsFolder"], executeOptions)

            assert.include(result, expectedResult1)
            assert.include(result, expectedResult2)
            assert.include(result, expectedResult3)
            assert.include(result, expectedResult4)
        })

        it('Should compile contracts with --compiler argument', async () => {
            let result = await execute(constants.cliCommands.COMPILE, ["--compiler", LOCAL_COMPILER_URL], executeOptions)

            assert.include(result, expectedCompileResultExampleContract);
        })

        it('Should compile contracts with included sophia libs', async () => {
            // delete and copy new example contract with included default sophia's libraries
            let sourceContractPath = path.resolve(executeOptions.cwd, './../artifacts/includeSophiaLibs.aes');
            let destinationContractPath = path.resolve(executeOptions.cwd, './contracts/ExampleContract.aes');
            fs.unlinkSync(destinationContractPath);
            fs.copyFileSync(sourceContractPath, destinationContractPath);

            let result = await execute(constants.cliCommands.COMPILE, [], executeOptions);
            assert.include(result, "Skipping default include: String.aes");
            assert.include(result, "Skipping default include: Option.aes");
            assert.include(result, "Skipping default include: Func.aes");
            assert.include(result, "Skipping default include: Pair.aes");
            assert.include(result, "Skipping default include: Triple.aes");
            assert.include(result, expectedCompileResultExampleContract);
        })
    })

    describe('NOT Compile', () => {
        it('Should NOT compile contracts with --compiler argument - invalid one ', async () => {
            let result = await execute(constants.cliCommands.COMPILE, ["--compiler", INVALID_COMPILER_URL], executeOptions)
            chai.expect(result).to.satisfy(result =>
                result.includes('ENOTFOUND compiler.somewhere.com') ||
                result.includes('EAI_AGAIN compiler.somewhere.com'));
        })

        it('Should display error message to user if contract has not been compiled', async () => {
            let expectedError = 'reason: Unbound variable a at line 3, column 9';
            let result = await execute(constants.cliCommands.COMPILE, [constants.cliCommandsOptions.PATH, `${ path.resolve(executeOptions.cwd, '../multipleContractsFolder') }/FalseContract.aes`])
            assert.include(result, expectedError)
        })

        it('Should display file not found if path to unexisting file is specified', async () => {
            let expectedError = 'reason: ENOENT: no such file or directory';
            let result = await execute(constants.cliCommands.COMPILE, [constants.cliCommandsOptions.PATH, "../multipleContractsFolder/NotExistingContract.aes"])
            assert.include(result, expectedError)
        })
    })

    after(async () => {
        await execute(constants.cliCommands.COMPILER, [constants.cliCommandsOptions.STOP], executeOptions)
        fs.removeSync(`.${ constants.compileTestsFolderPath }`);
    })
})
