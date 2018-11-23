const utils = require('./../utils')
const fs = require('fs')
const gasLimit = 1000000;
const ttl = 100;

class Deployer {

	constructor(network , keypair = utils.config.keypair ) {
        this.network = network;
		this.keypair = keypair;
	}
    
    async selectNetwork() {
        if(this.network == "local"){
            return utils.config.localhost
        } 
         
        if(this.network == "edgenet"){
            return utils.config.edgenetHost
        } 
        
        return network
    }

    async readFile(path){
        return await fs.readFileSync(path, "utf-8")
    }

	async deploy(contractPath, gas = gasLimit) {
        let client = await utils.getClient(this.selectNetwork(), this.keypair);
        let contract = await this.readFile(contractPath);
        
        const compiledContract = await client.contractCompile(contract, { gas })
        const deployPromise = await compiledContract.deploy({options: { ttl, gas }, abi: "sophia"});
        const deployedContract = await deployPromise;

        let regex = new RegExp(/[\w]+.aes$/);
        let contractFileName = regex.exec(contractPath)

        console.log(`===== Contract: ${contractFileName} has been deployed =====`)
        console.log(deployedContract)
        
        return deployedContract;
	}
}

module.exports = Deployer;