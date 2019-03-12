const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const assert = chai.assert;
const execute = require('../../cli-commands/utils').forgaeExecute;
const waitForContainer = require('../utils').waitForContainer;
const constants = require('../constants.json');
const fs = require('fs-extra');
const path = require('path');

let executeOptions = {
	cwd: process.cwd() + constants.deployTestsFolderPath
};

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const Deployer = require("./../../cli-commands/forgae-deploy/forgae-deployer")
describe('ForgAE Deploy', () => {
	const secretKey = "bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca"
	before(async () => {
		fs.ensureDirSync(`.${constants.deployTestsFolderPath}`)

		await execute(constants.cliCommands.INIT, [], executeOptions)
		await execute(constants.cliCommands.NODE, [], executeOptions)
	})

	describe('Deployer', async () => {
		it('Should init Deployer with local network', async () => {
			//Arrange
			const expectedNetwork = "http://localhost:3001"
			const passedNetwork = "local"

			//Act
			const deployer = new Deployer(passedNetwork);

			//Assert
			assert.equal(deployer.network.url, expectedNetwork)
		})

		it('Should init Deployer with testnet network', async () => {
			//Arrange
			const expectedNetwork = "https://sdk-testnet.aepps.com"
			const passedNetwork = "testnet"

			//Act
			const deployer = new Deployer(passedNetwork);

			//Assert
			assert.equal(deployer.network.url, expectedNetwork)
		})

		it('Should init Deployer with mainnet network', async () => {
			//Arrange
			const expectedNetwork = "https://sdk-mainnet.aepps.com"
			const passedNetwork = "mainnet"

			//Act
			const deployer = new Deployer(passedNetwork);

			//Assert
			assert.equal(deployer.network.url, expectedNetwork)
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

		it('with network and secret on test network', async () => {
			let testSecretKey = constants.privateKeyTestnetDeploy;
			let result = '';

			const mainForgaeProjectDir = process.cwd();
			process.chdir(executeOptions.cwd);

			await exec(`npm link ${mainForgaeProjectDir}`);

			try {
				result = await execute(constants.cliCommands.DEPLOY, ["-n", "testnet", "-s", testSecretKey], executeOptions);
			} catch (err) {
				console.log(err);
				console.log(err.stdout.toString('utf8'));
			}

			process.chdir(mainForgaeProjectDir);

			assert.include(result, expectedDeployResult)
		});


		it('with invalid network arguments', async () => {
			let executePromise = execute(constants.cliCommands.DEPLOY, ["-n", "public"], executeOptions)
			await assert.isFulfilled(executePromise, "Error: Unrecognised network public");
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

		let running = await waitForContainer();
		if (running) {
			await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
		}

		fs.removeSync(`.${constants.deployTestsFolderPath}`)
	})
})

