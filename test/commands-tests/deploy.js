const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const assert = chai.assert;
const execute = require('../../cli-commands/utils').aeprojectExecute;
const dockerPs = require('../utils').dockerPs;
const constants = require('../constants.json')
const fs = require('fs-extra')
let executeOptions = {
	cwd: process.cwd() + constants.epochTestsFolderPath
};
const Deployer = require("./../../cli-commands/aeproject-deploy/epoch-deployer")

describe('Aeproject deploy', () => {

	before(async () => {
		fs.ensureDirSync(`.${constants.epochTestsFolderPath}`)

		await execute(constants.cliCommands.INIT, [], executeOptions)
		await execute(constants.cliCommands.EPOCH, [], executeOptions)
	})

	describe('Deployer', async () => {
		it('Should init Deployer with local network', async () => {
			//Arrange
			let expectedNetwork = "local"

			//Act
			let deployer = new Deployer(expectedNetwork);

			//Assert
			assert.equal(deployer.network, expectedNetwork)
		})

		it('Should init Deployer with edgenet network', async () => {
			//Arrange
			let expectedNetwork = "edgenet"

			//Act
			let deployer = new Deployer(expectedNetwork);

			//Assert
			assert.equal(deployer.network, expectedNetwork)
		})

		it('Should init Deployer with custom network', async () => {
			//Arrange
			let expectedNetwork = "http://customNodeUrl.com"

			//Act
			let deployer = new Deployer(expectedNetwork);

			//Assert
			assert.equal(deployer.network, expectedNetwork)
		})
	})

	describe('Commands', async () => {
		it('test', async () => {
		
		})
	})

	after(async () => {

		let running = await dockerPs();
		if (running) {
			await execute(constants.cliCommands.EPOCH, [constants.cliCommandsOptions.STOP], executeOptions)
        }
        
		fs.removeSync(`.${constants.epochTestsFolderPath}`)
	})
})