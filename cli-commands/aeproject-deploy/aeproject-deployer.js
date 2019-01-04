const utils = require('./../utils')
const fs = require('fs')
const gasLimit = 20000000;
const ttl = 100;

class Deployer {

    constructor(network, keypairOrSecret = utils.config.keypair) {
        this.network = network;
        if (utils.isKeyPair(keypairOrSecret)) {
            this.keypair = keypairOrSecret;
            return
        }
        if (typeof keypairOrSecret === 'string' || keypairOrSecret instanceof String) {
            this.keypair = {
                publicKey: utils.generatePublicKeyFromSecretKey(keypairOrSecret),
                secretKey: keypairOrSecret
            }

            console.log(this.keypair)
            return
        }

        throw new Error("Incorrect keypair or secret key passed")
    }

    async selectNetwork() {
        if (this.network == "local") {
            return utils.config.localhost
        }

        if (this.network == "edgenet") {
            return utils.config.edgenetHost
        }
        return this.network
    }

    async readFile(path) {
        return await fs.readFileSync(path, "utf-8")
    }

    /**
     * Deploy command
     * @deploy
     * @param {string} contractPath - Relative path to the contract
     * @param {int} gasLimit - Gas limit
     * @param {object} initArgs - Initial arguments that will be passed to init function.
     */
    async deploy(contractPath, gas = gasLimit, initState = "") {
        let client = await utils.getClient(await this.selectNetwork(), this.keypair);
        let contract = await this.readFile(contractPath);
        let deployOptions = {
            options: {
                ttl,
                gas
            },
            abi: "sophia"
        }
        if (initState != "") {
            deployOptions.initState = initState
        }
        const compiledContract = await client.contractCompile(contract, {
            gas
        })
        const deployPromise = await compiledContract.deploy(deployOptions)
        const deployedContract = await deployPromise;

        let regex = new RegExp(/[\w]+.aes$/);
        let contractFileName = regex.exec(contractPath)

        console.log(`===== Contract: ${contractFileName} has been deployed =====`)
        console.log(deployedContract)

        return deployedContract;
    }
}

module.exports = Deployer;