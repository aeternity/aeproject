const utils = require('./../../utils')
const fs = require('fs')
const gasLimit = 1000000;
const ttl = 100;

class Deployer {

	constructor(network , keypair = utils.config.keyPair ) {
        this.network = network;
		this.keypair = keypair;
	}
    
    async selectNetwork(network) {
        if(network == "local"){
            return utils.getClient(utils.config.localhost, this.keypair)
        } else if(network == "edgenet"){
            return utils.getClient(utils.config.edgenetHost, this.keypair)
        } else {
            return utils.getClient(network, this.keypair)
        }
    }

    async readFile(path){
        return await fs.readFileSync(path, "utf-8")
    }

	async deploy(contractPath, gas = gasLimit) {
        let client = await this.selectNetwork(this.network);
        let contract = await this.readFile(contractPath);
        
        const compiledContract = await client.contractCompile(contract, { gas })
        const deployPromise = compiledContract.deploy({options: { ttl, gas }, abi: "sophia"});
        const deployedContract = await deployPromise;
        
        return deployedContract;
	}
}

module.exports = Deployer;