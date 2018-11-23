const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const assert = chai.assert;
const execute = require('../../cli-commands/utils.js').execute;
const dockerPs = require('../utils').dockerPs;
const constants = require('../constants.json')
const fs = require('fs-extra')
let executeOptions = {
	cwd: process.cwd() + constants.epochTestsFolderPath
};


describe('Aeproject deploy', () => {

	before(async () => {
		fs.ensureDirSync(`.${constants.epochTestsFolderPath}`)

		await execute(constants.cliCommands.INIT, [], executeOptions)
		await execute(constants.cliCommands.EPOCH, [], executeOptions)
	})

	it('test', async () => {
		
	})

	after(async () => {

		let running = await dockerPs();
		if (running) {
			await execute(constants.cliCommands.EPOCH, [constants.cliCommandsOptions.STOP], executeOptions)
        }
        
		fs.removeSync(`.${constants.epochTestsFolderPath}`)
	})
})