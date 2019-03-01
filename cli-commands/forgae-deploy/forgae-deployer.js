
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
                //a :assignContractsFunctionToDeployedContractInstance(contractPath, deployedContract)
            }

             let functions = assignContractsFunctionToDeployedContractInstance(contractPath, deployedContract);
            let tempModel =  Object.assign(additionalFunctionality, functions);
            const newObj = Object.assign(tempModel, obj);

        
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

        let funcName = func.name;
        let funcArgs = func.args;
        let funcReturnType = func.returnType;

        functions[funcName] = async function (args) { // this 'args' is for a hint when user is typing, if it is seeing

            const myName = funcName;
            const myArgs = funcArgs;
            const myReturnType = funcReturnType;

            let argsBuilder = '(';

            if (arguments.length > 0) {

                // console.log('--------');
                // console.log(myArgs);
                // console.log(arguments);
                // console.log('--------');

                for (let i = 0; i < myArgs.length; i++) {
                    
                    let argType = myArgs[i].type.toLowerCase();
                    
                    switch (argType) {
                        //case 'address': //TODO 
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

                // trim last 'comma'
                argsBuilder = argsBuilder.substr(0, argsBuilder.length - 1);
            }

            let amount = 0;
            if (arguments.length > myArgs.length) {

                if(arguments[arguments.length -1].value && !isNaN(arguments[arguments.length -1].value)) {
                    amount = parseInt(arguments[arguments.length -1].value);
                }
            }
            
            argsBuilder += ')';
            // console.log('[ARG BUILDER]');
            // console.log(argsBuilder);

            let resultFromExecution =  await deployedContract.call(myName, {
                args: argsBuilder, //`(${ownerPublicKeyAsHex}, 1000)`,
                options: {
                    ttl: ttl,
                    amount: amount
                },
                abi: ABI_TYPE
            });

            return (await resultFromExecution.decode(myReturnType)).value;
        }
    }

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

    return processedArgs;
}

module.exports = Deployer;