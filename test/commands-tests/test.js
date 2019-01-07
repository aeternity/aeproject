const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const fs = require('fs-extra')
const assert = chai.assert;
const execute = require('../../cli-commands/utils').forgaeExecute;
const utils = require('../../cli-commands/utils');
const test = require('../../cli-commands/forgae-test/test')
const sinon = require('sinon')
const constants = require('../constants.json')

var shell = require('shelljs');

let executeOptions = {
	cwd: process.cwd() + constants.testTestsFolderPath
};

describe('ForgAE Test', () => {

	before(async function () {
		fs.ensureDirSync(`.${constants.testTestsFolderPath}`)
		await execute(constants.cliCommands.INIT, [], executeOptions)
		await execute(constants.cliCommands.NODE, [], executeOptions)
	})

	it('should work on unexisting test folder', async function () {
		await assert.isFulfilled(test.run(constants.testTestsFolderPath))
	})

	it('shоuld throw on wrong path', async function () {
		await assert.isRejected(test.run('wrongTestDirectory'));

	});
	//TODO: Sinon test should be reworked with the new node version 
	xit('should execute test cli command with specific path', async function () {

		let forgaeTestSpy = sinon.spy(test, "run")
		var version = await shell.exec(`forgae test --path ${executeOptions}/exampleTests.js`, {
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
		fs.removeSync(`.${constants.testTestsFolderPath}`);
	})
})