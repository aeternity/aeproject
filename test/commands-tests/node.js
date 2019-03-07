const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
const execute = require('../../cli-commands/utils.js').forgaeExecute;
const waitForContainer = require('../utils').waitForContainer;
const waitUntilFundedBlocks = require('../utils').waitUntilFundedBlocks;
const constants = require('../constants.json')
const fs = require('fs-extra')
const nodeConfig = require('../../cli-commands/forgae-node/config.json')
const utils = require('../../cli-commands/utils')
let executeOptions = {
	cwd: process.cwd() + constants.nodeTestsFolderPath
};
chai.use(chaiAsPromised);
const assert = chai.assert;
const defaultWallets = nodeConfig.defaultWallets
let balanceOptions = {
	format: false
}


describe('ForgAE Node', () => {

	before(async () => {
		fs.ensureDirSync(`.${constants.nodeTestsFolderPath}`)

		await execute(constants.cliCommands.INIT, [], executeOptions)
		await execute(constants.cliCommands.NODE, [], executeOptions)
	})

	it('Should start the node successfully', async () => {
		let running = await waitForContainer();
		assert.isTrue(running, "node wasn't started properly");
	})

	it('Should check if the wallets are funded', async () => {

		let client = await utils.getClient(utils.config.localhostParams);
		await waitUntilFundedBlocks(client)
		for (let wallet in defaultWallets) {
			let recipientBalanace = await client.balance(defaultWallets[wallet].publicKey, balanceOptions)
			assert.isAbove(Number(recipientBalanace), 0, `${defaultWallets[wallet].publicKey} balance is not greater than 0`);
		}
	})

	it('Should check if the wallets are funded with the exact amount', async () => {
		let client = await utils.getClient(utils.config.localhostParams);
		for (let wallet in defaultWallets) {
			let recipientBalanace = await client.balance(defaultWallets[wallet].publicKey, balanceOptions)
			assert.equal(recipientBalanace, nodeConfig.config.amountToFund, `${defaultWallets[wallet].publicKey} balance is not greater than 0`);
		}
	})

	it('Should stop the node successfully', async () => {
		await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
		let running = await waitForContainer();
		assert.isNotTrue(running, "node wasn't stopped properly");
	})

	it('Process should stop when command is started at wrong folder.', async () => {
		let result = await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.START], {
			cwd: process.cwd()
		});

		if (result.indexOf('Process will be terminated!') < 0) {
			assert.isOk(false, "Process is still running in wrong folder.")
		}
	})

	after(async () => {

		let running = await waitForContainer();
		if (running) {
			await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
		}
		fs.removeSync(`.${constants.nodeTestsFolderPath}`)
	})
})

describe('ForgAE Node', async () => {
	it('Process should stop when command is started at wrong folder.', async () => {
		let result = await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.START], { cwd: process.cwd() });

		if (result.indexOf('Process will be terminated!') < 0) {
			assert.isOk(false, "Process is still running in wrong folder.")
		}
	})
})