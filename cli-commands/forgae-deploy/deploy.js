const fs = require('fs');
const defaultDeploymentFilePath = `deployment/deploy.js`;
const AeSDK = require('@aeternity/aepp-sdk');
const Crypto = AeSDK.Crypto

const verifyDeploymentFile = (deploymentFile) => {
	if (!fs.existsSync(deploymentFile)) {
		throw new Error(`${deploymentFile} file not found. Probably you've not initialized ForgAE. Please run forgae init first.`)
	}
};

const getDeployMethod = (deploymentFilePath) => {
	const _deploymentFilePath = (deploymentFilePath) ? deploymentFilePath : defaultDeploymentFilePath;
	verifyDeploymentFile(_deploymentFilePath)
	const deploymentFile = `${process.cwd()}/${_deploymentFilePath}`;
	const deployModule = require(deploymentFile);

	return deployModule.deploy;
};

const generatePublicKeyFromSecretKey = (secretKey) => {
	const hexStr = Crypto.hexStringToByte(secretKey.trim())
	const keys = Crypto.generateKeyPairFromSecret(hexStr)

	return Crypto.aeEncodeKey(keys.publicKey)
}

const run = async (deploymentFilePath, network, secretKey) => {
	const deployMethod = getDeployMethod(deploymentFilePath);
	
	try {
		await deployMethod(
			network, 
			{
				publicKey: generatePublicKeyFromSecretKey(secretKey), 
				secretKey
			});
		
		console.log(`Your deployment script finished successfully!`);
	} catch (e) {
        console.error(e);
	}
};

module.exports = {
	run
};