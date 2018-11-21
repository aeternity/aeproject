class Deployer {

	constructor(keypair, host) {
		this.secret = secret;
		this.host = host;
	}

	async deploy(contractPath) {
        let internalUrl = url;
        if(url.includes("localhost")){
            internalUrl = internalUrl + "/internal"
        }

        let client = await Universal({
            url: this.host,
            internalUrl: internalUrl,
            keypair: config.ownerKeyPair
        });
    
        const compiledContract = await client.contractCompile(oracleSource, { gas: config.gas })
        const deployPromise = compiledContract.deploy({options: { ttl: config.ttl, gas: config.gas}, abi: "sophia"});
        const deployedContract = await deployPromise;
	}
}

module.exports = Deployer;