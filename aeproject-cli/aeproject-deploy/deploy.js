const fs = require('fs');
const defaultDeploymentFilePath = `deployment/deploy.js`;
const path = require('path');

const verifyDeploymentFile = (deploymentFile) => {
    if (!fs.existsSync(deploymentFile)) {
        throw new Error(`${ deploymentFile } file not found. Probably you've not initialized AEproject. Please run aeproject init first.`)
    }
};

const getDeployMethod = (deploymentFilePath) => {
    const _deploymentFilePath = (deploymentFilePath) ? deploymentFilePath : defaultDeploymentFilePath;
    verifyDeploymentFile(_deploymentFilePath);

    const deploymentFile = path.resolve(process.cwd(), _deploymentFilePath);
    const deployModule = require(deploymentFile);

    return deployModule.deploy;
};

const run = async (deploymentFilePath, network, secretKey, compiler, networkId) => {
    const deployMethod = getDeployMethod(deploymentFilePath);

    try {
        await deployMethod(network, secretKey, compiler, networkId);
        console.log(`Your deployment script finished successfully!`);
    } catch (e) {
        console.error(e);
        throw e
    }
};

module.exports = {
    run
};