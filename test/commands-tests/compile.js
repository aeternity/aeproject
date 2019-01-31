const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const assert = chai.assert;
const execute = require('../../cli-commands/utils.js').forgaeExecute;
const fs = require('fs-extra')
const constants = require('../constants.json')
const expectedCompileResultExampleContract = "ExampleContract.aes has been successfully compiled'"

let expectedResult1 = "ExampleContract1.aes has been successfully compiled"
let expectedResult2 = "ExampleContract2.aes has been successfully compiled"
let expectedResult3 = "ExampleContract3.aes has been successfully compiled"
let executeOptions = {
	cwd: process.cwd() + constants.compileTestsFolderPath
};
chai.use(chaiAsPromised);

describe('ForgAE Compile', () => {
	before(async () => {
		fs.ensureDirSync(`.${constants.compileTestsFolderPath}`)
		console.log(executeOptions.cwd)
		await execute(constants.cliCommands.INIT, [], executeOptions)
		// await execute(constants.cliCommands.NODE, [], executeOptions)
		fs.readdir(executeOptions.cwd, function (err, items) {
			console.log(items);

			for (var i = 0; i < items.length; i++) {
				console.log(items[i]);
			}
		});
	})

	describe('Compile', () => {
		it('Should compile contract successfully with specif contract path', async () => {
			let result = await execute(constants.cliCommands.COMPILE, [constants.cliCommandsOptions.PATH, `${executeOptions.cwd}/contracts/ExampleContract.aes`])
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
		})

		it('Should compile contracts with nodeUrl argument - localhost', async () => {
			let result = await execute(constants.cliCommands.COMPILE, ["-n", "http://localhost:3001"], executeOptions)

			assert.include(result, expectedCompileResultExampleContract)
		})

		it('Should compile contracts with nodeUrl argument - edgenet ', async () => {
			let result = await execute(constants.cliCommands.COMPILE, ["-n", "https://sdk-edgenet.aepps.com"], executeOptions)

			assert.include(result, expectedCompileResultExampleContract)
		})
	})

	after(async () => {
		await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
		fs.removeSync(`.${constants.compileTestsFolderPath}`);
	})
})