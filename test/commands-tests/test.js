const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const fs = require('fs-extra')
const assert = chai.assert;
const execute = require('../../utils').execute;
const utils = require('../../utils');
const test = require('../../cli-commands/test/test')
const sinon = require('sinon')
const constants = require('../constants.json')

var shell = require('shelljs');

let executeOptions = {
	cwd: process.cwd() + constants.testTestsFolderPath
};

describe('Aeproject Test', () => {

	before(async function () {
		currentDir = process.cwd();

		fs.ensureDirSync(`.${constants.testTestsFolderPath}`)
		utils.copyFileOrDir(`${currentDir}${constants.sourceTestsFilesPath}`, `${currentDir}${constants.testTestsFolderPath}${constants.exampleContractTests}`);
	})

	it('should work on unexisting test folder', async function () {
		await assert.isFulfilled(test.run(constants.testTestsFolderPath))
	})

	it('shоuld throw on wrong path', async function () {
		await assert.isRejected(test.run('wrongTestDirectory'));

	});
	//TODO: Sinon test should be reworked with the new epoch version 
	xit('should execute test cli command with specific path', async function () {

		let aeprojectTestSpy = sinon.spy(test, "run")
		var version = await shell.exec(`aeproject test --path ${currentDir}/test/contractsTests/exampleTests.js`, {
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
		process.chdir(currentDir);
		fs.removeSync(`.${constants.testTestsFolderPath}`);
	})
})