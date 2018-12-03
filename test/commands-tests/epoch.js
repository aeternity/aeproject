const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const assert = chai.assert;
const execute = require('../../cli-commands/utils.js').aeprojectExecute;
const dockerPs = require('../utils').dockerPs;
const constants = require('../constants.json')
const fs = require('fs-extra')
let executeOptions = {
	cwd: process.cwd() + constants.epochTestsFolderPath
};


describe('Aeproject Epoch', () => {

	before(async () => {
		fs.ensureDirSync(`.${constants.epochTestsFolderPath}`)

		await execute(constants.cliCommands.INIT, [], executeOptions)
		await execute(constants.cliCommands.EPOCH, [], executeOptions)
	})

	it('Should start the epoch successfully', async () => {
		let running = await dockerPs();
		assert.isTrue(running, "Epoch wasn't started properly");
	})

	it('Should stop the epoch successfully', async () => {
		await execute(constants.cliCommands.EPOCH, [constants.cliCommandsOptions.STOP], executeOptions)
		let running = await dockerPs();
		assert.isNotTrue(running, "Epoch wasn't stopped properly");
	})

	// TODO add test seeing that the wallets were funded

	after(async () => {

		let running = await dockerPs();
		if (running) {
			await execute(constants.cliCommands.EPOCH, [constants.cliCommandsOptions.STOP], executeOptions)
		}
		fs.removeSync(`.${constants.epochTestsFolderPath}`)
	})
})