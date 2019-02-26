
const Crypto = require('@aeternity/aepp-sdk').Crypto;

const utils = require('./../utils')
const fs = require('fs')
const gasLimit = 20000000;
const ttl = 100;
const logStoreService = require('./../forgae-history/log-store-service');
const execute = require('./../utils').execute;

const ABI_TYPE = 'sophia';

let client;

logStoreService.initHistoryRecord();

function getContractName(contract) {
    let rgx = /contract\s([a-zA-Z0-9]+)\s=/g;
    var match = rgx.exec(contract);

    return match[1];
}

async function getTxInfo(txHash) {
    let result;
    try {
        result = await client.getTxInfo(txHash)
    } catch (error) {
        let info = {
            gasUsed: 0,
            gasPrice: 0
        };

        return info;
    }
    return result;
}

class Deployer {

    constructor(network = "local", keypairOrSecret = utils.config.keypair) {
        this.network = utils.getNetwork(network);
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
        let self = this;
        
        client = await utils.getClient(this.network, this.keypair);
        let contract = await this.readFile(contractPath);
        let deployOptions = {
            options: {
                ttl
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
        let deployedContract = await deployPromise;

        deployedContract = addFromFunction(deployedContract);

        let regex = new RegExp(/[\w]+.aes$/);
        let contractFileName = regex.exec(contractPath);

        let txInfo = await getTxInfo(deployedContract.transaction);
        let isSuccess = false;
        if (deployedContract.transaction) {
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

        function addFromFunction (obj) {

            const additionalFunctionality = {
                from: function (secretKey) {

                    return {
                        call: async function (functionName, options) {

                            const keyPair = await generateKeyPairFromSecretKey(secretKey);
                            const newClient = await utils.getClient(self.network, keyPair);

                            const anotherClientConfiguration = {
                                client: newClient,
                                byteCode: compiledContract.bytecode,
                                contractAddress: obj.address
                            }

                            let configuration = {
                                options: {
                                    ttl: ttl
                                },
                                abi: ABI_TYPE,
                            };
                        
                            if (options.args) {
                                configuration.args = options.args
                            }

                            if (options.amount && options.amount > 0) {
                                configuration.options.amount = options.amount;
                            }
                        
                            return await anotherClientConfiguration.client.contractCall(anotherClientConfiguration.byteCode, ABI_TYPE, anotherClientConfiguration.contractAddress, functionName, configuration);
                        }
                    }
                }
            }

            const newObj = Object.assign(additionalFunctionality, obj);
        
            return newObj;
        }
    }
}

async function generateKeyPairFromSecretKey(secretKey) {
    const hexStr = await Crypto.hexStringToByte(secretKey.trim());
    const keys = await Crypto.generateKeyPairFromSecret(hexStr);

    const publicKey = await Crypto.aeEncodeKey(keys.publicKey);

    let keyPair = {
        publicKey,
        secretKey
    }

    return keyPair;
}

module.exports = Deployer;