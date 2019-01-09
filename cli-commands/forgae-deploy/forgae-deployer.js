const utils = require('./../utils')
const fs = require('fs')
const gasLimit = 20000000;
const ttl = 100;
const logStoreService = require('./../forgae-history/log-store-service');
const execute = require('./../utils').execute;

logStoreService.initHistoryRecord();

function getContractName (contract) {
    let rgx = /contract\s([a-zA-Z0-9]+)\s=/g;
    var match = rgx.exec(contract);

    return match[1];
}

async function getTxInfo(txHash, network) {

    function extractUsedGas(txInfo) {
        let rgx = /Gas[_]+\s(\d+)/g;
        var match = rgx.exec(txInfo);
    
        return match[1];
    }
    
    function extractGasPrice(txInfo) {
        let rgx = /Gas\sPrice[_]+\s(\d+)/g
        var match = rgx.exec(txInfo);
        
        return match[1];
    }
    
    let result;
    try {
        result = await execute('aecli', 'inspect', [txHash, '-u', network]);
    } catch (error) {
        let info = {
            gasUsed: 0,
            gasPrice: 0
        };

        return info;
    }
    
    let temp = '';
    for (const key in result) {
        if (result.hasOwnProperty(key)) {
            //console.log(key, result[key])
            temp += result[key]
        }
    }

    let info = {};
    info.gasUsed = extractUsedGas(temp) || -1;
    info.gasPrice = extractGasPrice(temp) || -1;

    return info;
}

class Deployer {

    constructor(network = "local", keypairOrSecret = utils.config.keypair) {
        this.network = this.getNetwork(network);
        if (utils.isKeyPair(keypairOrSecret)) {
            this.keypair = keypairOrSecret;
            return
        }
        if (typeof keypairOrSecret === 'string' || keypairOrSecret instanceof String) {
            this.keypair = {
                publicKey: utils.generatePublicKeyFromSecretKey(keypairOrSecret),
                secretKey: keypairOrSecret
            }
            return
        }

        throw new Error("Incorrect keypair or secret key passed")
    }

    getNetwork(network) {
        const networks = {
            local: utils.config.localhost,
            edgenet: utils.config.edgenetHost,
            testnet: utils.config.testnetHost,
            mainnet: utils.config.mainnetHost
        }

        const result = networks[network]
        if (!result) {
            throw new Error(`Unrecognised network ${network}`)
        }

        return result
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
        let client = await utils.getClient(this.network, this.keypair);
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
        });

        const deployPromise = await compiledContract.deploy(deployOptions);
        const deployedContract = await deployPromise;

        let regex = new RegExp(/[\w]+.aes$/);
        let contractFileName = regex.exec(contractPath);

        let txInfo = await getTxInfo(deployedContract.transaction, this.network);
        let isSuccess = false;
        if(deployedContract.transaction) {
            isSuccess = true;
        }
        
        let info = {
            deployerType: this.constructor.name,
            nameOrLabel: getContractName(contract),
            transactionHash: deployedContract.transaction,
            status: isSuccess,
            gasPrice: txInfo.gasPrice, 
            gasUsed: txInfo.gasUsed, 
            result: deployedContract.address
        }

        logStoreService.logAction(info);

        console.log(`===== Contract: ${contractFileName} has been deployed =====`)

        return deployedContract;
    }
}

module.exports = Deployer;