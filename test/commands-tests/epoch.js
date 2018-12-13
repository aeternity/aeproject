const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
const execute = require('../../cli-commands/utils.js').aeprojectExecute;
const dockerPs = require('../utils').dockerPs;
const constants = require('../constants.json')
const fs = require('fs-extra')
const epochConfig = require('../../cli-commands/aeproject-epoch/config.json')
const utils = require('../../cli-commands/utils')
let executeOptions = {
	cwd: process.cwd() + constants.epochTestsFolderPath
};
chai.use(chaiAsPromised);
const assert = chai.assert;
const defaultWallets = epochConfig.defaultWallets


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

	it('Should check if the wallets are funded', async () => {
		await execute(constants.cliCommands.EPOCH, [], executeOptions)

		let client = await utils.getClient(epochConfig.config.host);
		for (let wallet in defaultWallets) {
			let recipientBalanace = await client.balance(defaultWallets[wallet].publicKey)
			assert.isAbove(Number(recipientBalanace), 0, `${defaultWallets[wallet].publicKey} balance is not greater than 0`);
		}
	})

	it('Should check if the wallets are funded with the exact amount', async () => {
		await execute(constants.cliCommands.EPOCH, [], executeOptions)

		let client = await utils.getClient(epochConfig.config.host);
		for (let wallet in defaultWallets) {
			let recipientBalanace = await client.balance(defaultWallets[wallet].publicKey)
			assert.equal(Number(recipientBalanace), epochConfig.config.amountToFund, `${defaultWallets[wallet].publicKey} balance is not greater than 0`);
		}
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