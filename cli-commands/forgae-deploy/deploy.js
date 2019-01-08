const fs = require('fs');
const defaultDeploymentFilePath = `deployment/deploy.js`;
const AeSDK = require('@aeternity/aepp-sdk');
const path = require('path');

const verifyDeploymentFile = (deploymentFile) => {
	if (!fs.existsSync(deploymentFile)) {
		throw new Error(`${deploymentFile} file not found. Probably you've not initialized ForgAE. Please run forgae init first.`)
	}
};

const getDeployMethod = (deploymentFilePath) => {
	const _deploymentFilePath = (deploymentFilePath) ? deploymentFilePath : defaultDeploymentFilePath;
	verifyDeploymentFile(_deploymentFilePath);

	const deploymentFile = path.resolve(process.cwd(),_deploymentFilePath);
	const deployModule = require(deploymentFile);

	return deployModule.deploy;
};

const run = async (deploymentFilePath, network, secretKey) => {
	const deployMethod = getDeployMethod(deploymentFilePath);

	try {
		await deployMethod(network, secretKey);

		console.log(`Your deployment script finished successfully!`);
	} catch (e) {
		console.error(e);
		throw e
	}
};

module.exports = {
	run
};