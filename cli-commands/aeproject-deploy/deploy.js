const fs = require('fs');
const defaultDeploymentFilePath = `deployment/deploy.js`;

const verifyDeploymentFile = (deploymentFile) => {
	if (!fs.existsSync(deploymentFile)) {
		throw new Error(`${deploymentFile} file not found. Probably you've not initialized aeproject. Please run aeproject init first.`)
	}
};

const getDeployMethod = (deploymentFilePath) => {
	const _deploymentFilePath = (deploymentFilePath) ? deploymentFilePath : defaultDeploymentFilePath;
	verifyDeploymentFile(_deploymentFilePath)
	const deploymentFile = `${process.cwd()}/${_deploymentFilePath}`;
	const deployModule = require(deploymentFile);

	return deployModule.deploy;
};

const run = async (deploymentFilePath, network, keypair) => {
	const deployMethod = getDeployMethod(deploymentFilePath);
	try {
		await deployMethod();
		
		console.log(`Your deployment script finished successfully!`);
	} catch (e) {
        console.error(e);
	}
};

module.exports = {
	run
};