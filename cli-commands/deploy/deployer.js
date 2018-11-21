const fs = require('fs');
const defaultDeploymentFilePath = `deploy/deploy.js`;

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

const run = async (deploymentFilePath, network, secret, silent) => {
	const deployMethod = getDeployMethod(deploymentFilePath);

	try {
		await deployMethod(network, secret);
		logger.log(`Your deployment script finished successfully!`);
	} catch (e) {
		if (!silent) {
            console.error(e);
            //todo: printError
		}

        // logger.log(`Your deployment script finished with failure!`);
        //todo: printError
	}
};

module.exports = {
	run
};