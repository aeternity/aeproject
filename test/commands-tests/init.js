const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
const execute = require('../../cli-commands/utils.js').execute;
const fs = require('fs-extra')
const constants = require('../constants.json')

let executeOptions = {
	cwd: process.cwd() + constants.initTestsFolderPath
};

chai.use(chaiFiles);

describe('Aeproject Init', () => {
	before(async () => {
		fs.ensureDirSync(`.${constants.initTestsFolderPath}`)
	})

	it('Should init project successfully', async () => {
		await execute(constants.cliCommands.INIT, [], executeOptions)

		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.packageJson}`), "package.json doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.packageLockJson}`), "package-lock.json doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerComposeYml}`), "docker-compose.yml doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.testContractPath}`), "test contract doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.deployScriptsPath}`), "deploy scripts doesn't exists");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.contractsPath}`), "example contract doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.nodeModules}`), "node modules folder doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerEntryPoint}`), "docker entrypoint.sh doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerEpochNode1}`), "docker epoch node1 doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerEpochNode2}`), "docker epoch node2 doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerEpochNode3}`), "docker epoch node3 doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerHealthCheck}`), "docker healtcheck.sh doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerNginxCors}`), "docker nginx-cors.conf doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerNginxDefault}`), "docker nginx-default doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerNginxWs}`), "docker nginx-ws doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerKeys}`), "docker keys folder doesn't exist");
	})


	it.only('Should update project successfully', async () => {
		//Arrange
		const editedContent = "edited content"
		await execute(constants.cliCommands.INIT, [], executeOptions)

		//Act
		fs.writeFile(executeOptions.cwd + constants.testsFiles.packageJson, editedContent)
		fs.writeFile(executeOptions.cwd + constants.testsFiles.dockerComposeYml, editedContent)
		
		await execute(constants.cliCommands.INIT, ["--update"], executeOptions)

		// //assert
		let editPackageJson = fs.readFileSync(executeOptions.cwd + constants.testsFiles.packageJson,'utf8')
		let editedDockerComposeYml = fs.readFileSync(executeOptions.cwd + constants.testsFiles.dockerComposeYml, 'utf8')
		
		assert.equal(editPackageJson, editedContent)
		assert.notEqual(editedDockerComposeYml, editedContent)

		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.packageJson}`), "package.json doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.packageLockJson}`), "package-lock.json doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerComposeYml}`), "docker-compose.yml doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.testContractPath}`), "test contract doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.deployScriptsPath}`), "deploy scripts doesn't exists");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.contractsPath}`), "example contract doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.nodeModules}`), "node modules folder doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerEntryPoint}`), "docker entrypoint.sh doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerEpochNode1}`), "docker epoch node1 doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerEpochNode2}`), "docker epoch node2 doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerEpochNode3}`), "docker epoch node3 doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerHealthCheck}`), "docker healtcheck.sh doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerNginxCors}`), "docker nginx-cors.conf doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerNginxDefault}`), "docker nginx-default doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerNginxWs}`), "docker nginx-ws doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerKeys}`), "docker keys folder doesn't exist");
	})

	after(async () => {
		fs.removeSync(`.${constants.initTestsFolderPath}`);
	})
})