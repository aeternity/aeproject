const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const assert = chai.assert;
const execute = require('../../cli-commands/utils').aeprojectExecute;
const dockerPs = require('../utils').dockerPs;
const constants = require('../constants.json')
const fs = require('fs-extra')
let executeOptions = {
	cwd: process.cwd() + constants.deployTestsFolderPath
};
const Deployer = require("./../../cli-commands/aeproject-deploy/epoch-deployer")
describe('Aeproject deploy', () => {
	const secretKey = "bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca"
	before(async () => {
		fs.ensureDirSync(`.${constants.deployTestsFolderPath}`)

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

		it('Should deploy contract with init arguments', async () => {
			//Arrange
			let expectedNetwork = "local"
			let expectedInitValue = "testString"
			let deployer = new Deployer(expectedNetwork);

			//Act
			let deployedContract = await deployer.deploy("./test/commands-tests/multipleContractsFolder/ExampleContract4.aes", 250250, `("${expectedInitValue}")`)

			const callNamePromise = deployedContract.call('name', {
				options: {
					ttl: 50
				}
			});
			assert.isFulfilled(callNamePromise, 'Could call the name');
			const callNameResult = await callNamePromise;

			//Assert
			const decodedNameResult = await callNameResult.decode("string");
			assert.equal(decodedNameResult.value, expectedInitValue)
		})
	})

	describe('Deploy command ', async () => {
		let expectedDeployResult = "ExampleContract.aes has been deployed";

		it('without any arguments', async () => {
			let result = await execute(constants.cliCommands.DEPLOY, [], executeOptions)
			assert.include(result, expectedDeployResult)
		})

		it('with network arguments', async () => {
			let result = await execute(constants.cliCommands.DEPLOY, ["-n", "local"], executeOptions)

			assert.include(result, expectedDeployResult)
		})

		it('with secret key arguments', async () => {
			let result = await execute(constants.cliCommands.DEPLOY, ["-s", secretKey], executeOptions)

			assert.include(result, expectedDeployResult)
		})

		it('with path arguments', async () => {
			let result = await execute(constants.cliCommands.DEPLOY, ["--path", "./deployment/deploy.js"], executeOptions)

			assert.include(result, expectedDeployResult)
		})

		it('with secret key and network arguments', async () => {
			let result = await execute(constants.cliCommands.DEPLOY, ["-s", secretKey, "-n", "local"], executeOptions)

			assert.include(result, expectedDeployResult)
		})

		it('with secret key and path arguments', async () => {
			let result = await execute(constants.cliCommands.DEPLOY, ["-s", secretKey, "--path", "./deployment/deploy.js"], executeOptions)

			assert.include(result, expectedDeployResult)
		})

		it('with network key and path arguments', async () => {
			let result = await execute(constants.cliCommands.DEPLOY, ["-n", "local", "--path", "./deployment/deploy.js"], executeOptions)

			assert.include(result, expectedDeployResult)
		})

		it('with all arguments', async () => {
			let result = await execute(constants.cliCommands.DEPLOY, ["-n", "local", "-s", secretKey, "--path", "./deployment/deploy.js"], executeOptions)

			assert.include(result, expectedDeployResult)
		})

		it('with invalid network arguments', async () => {
			let executePromise = execute(constants.cliCommands.DEPLOY, ["-n", "public"], executeOptions)

			await assert.isRejected(executePromise);
		})

		it('with invalid password arguments', async () => {
			let executePromise = execute(constants.cliCommands.DEPLOY, ["-s", "password"], executeOptions)

			await assert.isFulfilled(executePromise, "bad secret key size");
		})

		it('with invalid path arguments', async () => {
			let executePromise = execute(constants.cliCommands.DEPLOY, ["--path", "wrongPath"], executeOptions)

			await assert.isFulfilled(executePromise, "wrongPath");
		})
	})

	after(async () => {

		let running = await dockerPs();
		if (running) {
			await execute(constants.cliCommands.EPOCH, [constants.cliCommandsOptions.STOP], executeOptions)
		}

		fs.removeSync(`.${constants.deployTestsFolderPath}`)
	})
})