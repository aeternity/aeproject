const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const assert = chai.assert;
const execute = require('../../packages/aeproject-utils/utils/aeproject-utils.js').aeprojectExecute;
const fs = require('fs-extra')
const constants = require('../constants.json')
const expectedCompileResultExampleContract = "ExampleContract.aes has been successfully compiled'"

let expectedResult1 = "ExampleContract1.aes has been successfully compiled"
let expectedResult2 = "ExampleContract2.aes has been successfully compiled"
let expectedResult3 = "ExampleContract3.aes has been successfully compiled"
let expectedResult4 = "math.aes has been successfully compiled"
let expectedResult5 = "ENOTFOUND compiler.somewhere.com compiler.somewhere.com"
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
        await execute(constants.cliCommands.NODE, [], executeOptions)
    })

    describe('Compile', () => {
        it('Should compile contract successfully with specif contract path', async () => {
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

        it('Should NOT compile contracts with --compiler argument - invalid one ', async () => {
            let result = await execute(constants.cliCommands.COMPILE, ["--compiler", INVALID_COMPILER_URL], executeOptions)
            assert.include(result, expectedResult5);
        })
    })

    after(async () => {
        await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
        fs.removeSync(`.${ constants.compileTestsFolderPath }`);
    })
})