
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

                    if (!secretKey || !isNaN(secretKey) || secretKey.length !== 128) {
                        throw new Error('Invalid secret key!');
                    }

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
                },
                functions: assignContractsFunctionToDeployedContractInstance(contractPath, deployedContract)
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

function assignContractsFunctionToDeployedContractInstance(contractPath, deployedContract) {
    let functionsDescription = getContractFunctions(contractPath);

    let functions = {};

    for (func of functionsDescription) {
        functions[func.name] = async function (amount = 0, args) {
            
            let argsBuilder = '(';

            if (arguments.length > 1) {
                for (let i = 1; i < arguments.length; i++) {

                    console.log();
                    console.log('i', i);
                    console.log('func name', func.name);
                    console.log('args', arguments);
                    console.log('func args', func.args);
                    console.log();
                    let argType = func.args[i - 1].type.toLowerCase();

                    switch (argType) {
                        
                        case 'int':
                            argsBuilder += `${arguments[i]},`
                            break;

                        case 'bool':
                            if (arguments[i]) {
                                argsBuilder += `true,`
                            } else {
                                argsBuilder += `false,`
                            }
                            
                            break;

                        case 'string':
                        default:
                            argsBuilder += `"${arguments[i]}",`
                            break;
                    }
                }

                argsBuilder = argsBuilder.trim(',');
                argsBuilder += ')';
            }


            
            console.log(argsBuilder);
            let resultFromExecution =  await deployedContract.call(func.name, {
                args: argsBuilder, //`(${ownerPublicKeyAsHex}, 1000)`,
                options: {
                    ttl: ttl,
                    amount: amount
                },
                abi: ABI_TYPE
            });

            return await resultFromExecution.decode(func.returnType);
        }
    }

    console.log('======> [functions] <=========');
    console.log(functions);

    return functions;
}

function getContractFunctions(contractPath) {
    // add-contract-funcs-to-deployed-contract-instance-#59

    let contract = fs.readFileSync(contractPath, 'utf-8');

    let rgx = /public\s+(?:stateful\s{1})*function\s+(?:([\w\d\-\_]+)\s{0,1}\(([\w\d\_\-\,\:\s]*)\))\s*(?:\:*\s*([\w]+)\s*)*=/gm;
    
    let matches = [];

    let match = rgx.exec(contract);
    while(match) {

        // set function name
        let temp = {
            name: match[1],
            args: [],
            returnType: '()'
        }

        console.log();
        console.log(temp.name);
        // console.log();

        // set functions args
        if (match.length >= 3 && match[2]) {
            let args = processArguments(match[2]);
            temp.args = args;
        }

        // set functions returned type
        if (match.length >= 4 && match[3]) {
            temp.returnType = match[3]
        }

        matches.push(temp);
        match = rgx.exec(contract);
    }

    return matches;
}

function processArguments (args) {
    let splitedArgs = args.split(',').map(x => x.trim());
    let processedArgs = [];

    for (let i = 0; i < splitedArgs.length; i++) {
        let tokens = splitedArgs[i].split(':').map(x => x.trim());
        let processedArg = {
            name: tokens[0],
            type: null
        };

        if (tokens.length > 1) {
            processedArg.type = tokens[1];
        }

        processedArgs.push(processedArg);
    }


    console.log();
    console.log('process args');
    console.log(processedArgs);
    console.log();

    return processedArgs;
}

module.exports = Deployer;