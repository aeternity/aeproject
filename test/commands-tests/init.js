const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
const execute = require('../../packages/forgae-utils/utils/forgae-utils.js').forgaeExecute;
const fs = require('fs-extra')
const constants = require('../constants.json')
const packageJson = require('../../packages/forgae-cli/package.json')
const utilsPackageJson = require('../../packages/forgae-utils/package.json')

let executeOptions = {
	cwd: process.cwd() + constants.initTestsFolderPath
};

chai.use(chaiFiles);

describe('ForgAE Init', () => {
	before(async () => {
		fs.ensureDirSync(`.${constants.initTestsFolderPath}`)
	});

	it('Should init project successfully', async () => {
		await execute(constants.cliCommands.INIT, [], executeOptions)

		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.packageJson}`), "package.json doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.packageLockJson}`), "package-lock.json doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerComposeYml}`), "docker-compose.yml doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.testContractPath}`), "test contract doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.deployScriptsPath}`), "deploy scripts doesn't exists");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.contractsPath}`), "example contract doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.contractsAeppSettings}`), "contracts aepp settings file doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.nodeModules}`), "node modules folder doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerEntryPoint}`), "docker entrypoint.sh doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockernodeNode1}`), "docker node node1 doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockernodeNode2}`), "docker node node2 doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockernodeNode3}`), "docker node node3 doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerHealthCheck}`), "docker healtcheck.sh doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerNginxCors}`), "docker nginx-cors.conf doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerNginxDefault}`), "docker nginx-default doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerNginxWs}`), "docker nginx-ws doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerKeys}`), "docker keys folder doesn't exist");
	});


	it('Should update project successfully', async () => {
		//Arrange
		const editedContent = "edited content"
		await execute(constants.cliCommands.INIT, [], executeOptions)

		//Act
		fs.writeFile(executeOptions.cwd + constants.testsFiles.dockerComposeYml, editedContent)

		await execute(constants.cliCommands.INIT, ["--update"], executeOptions)

		// //assert
		let editedDockerComposeYml = fs.readFileSync(executeOptions.cwd + constants.testsFiles.dockerComposeYml, 'utf8')

		const forgae_lib = packageJson.dependencies['forgae-lib']; // this is to be inplemented once forgae lib has been published to npm
		const forgae_config = packageJson.dependencies['forgae-config']; 
		const forgae_utils = packageJson.dependencies['forgae-utils']; 
		const forgae_logger = packageJson.dependencies['forgae-logger'];
		const sdkVersion = utilsPackageJson.dependencies['@aeternity/aepp-sdk'];
		const projectPackageJson = require("./initTests/package.json");

		const sdkVersionInProject = projectPackageJson.dependencies['@aeternity/aepp-sdk'];
		const forgaeLibInProject = projectPackageJson.dependencies['forgae-lib']; // this is to be inplemented once forgae lib has been published to npm
		const forgaeConfigInProject = projectPackageJson.dependencies['forgae-config'];
		const forgaeUtilsInProject = projectPackageJson.dependencies['forgae-utils'];
		const forgaeLoggerInProject = projectPackageJson.dependencies['forgae-logger'];


		assert.notEqual(editedDockerComposeYml, editedContent);
		assert.equal(sdkVersion, sdkVersionInProject, "sdk version is not updated properly");
		assert.equal(forgae_lib.slice(1), forgaeLibInProject, "forgae-lib is not updated properly");
		assert.equal(forgae_config.slice(1), forgaeConfigInProject, "forgae-config is not updated properly");
		assert.equal(forgae_utils.slice(1), forgaeUtilsInProject, "forgae-utils is not updated properly");
		assert.equal(forgae_logger.slice(1), forgaeLoggerInProject, "forgae-logger is not updated properly");

		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.packageJson}`), "package.json doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.packageLockJson}`), "package-lock.json doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerComposeYml}`), "docker-compose.yml doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.testContractPath}`), "test contract doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.deployScriptsPath}`), "deploy scripts doesn't exists");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.contractsPath}`), "example contract doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.nodeModules}`), "node modules folder doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerEntryPoint}`), "docker entrypoint.sh doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockernodeNode1}`), "docker node node1 doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockernodeNode2}`), "docker node node2 doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockernodeNode3}`), "docker node node3 doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerHealthCheck}`), "docker healtcheck.sh doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerNginxCors}`), "docker nginx-cors.conf doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerNginxDefault}`), "docker nginx-default doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerNginxWs}`), "docker nginx-ws doesn't exist");
		assert.isTrue(fs.existsSync(`${executeOptions.cwd}${constants.testsFiles.dockerKeys}`), "docker keys folder doesn't exist");
	});

	after(async () => {
		fs.removeSync(`.${constants.initTestsFolderPath}`);
	})
})