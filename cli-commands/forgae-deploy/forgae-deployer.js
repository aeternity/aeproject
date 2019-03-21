const utils = require('./../utils')
const fs = require('fs')
const gasLimit = 20000000;
const ttl = 100;
const logStoreService = require('./../forgae-history/log-store-service');

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
        
        client = await utils.getClient(this.network, this.keypair);
        let contract = await this.readFile(contractPath);
        let deployOptions = {
            options: {
                ttl
            },
            abi: "sophia"
        };
        if (initState != "") {
            deployOptions.initState = initState
        }
        const compiledContract = await client.contractCompile(contract, {
            gas
        });

        let deployedContract = await compiledContract.deploy(deployOptions);

        // extract smart contract's functions info, process it and generate function that would be assigned to deployed contract's instance 
        let functions = await generateFunctionsFromSmartContract(contractPath, deployedContract, this.keypair.secretKey, compiledContract.bytecode, this.network);
        deployedContract = addSmartContractFunctions(deployedContract, functions);

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

        console.log(`===== Contract: ${contractFileName} has been deployed =====`);

        return deployedContract;

        function addSmartContractFunctions(deployedContract, functions) {
            let newInstanceWithAddedAdditionalFunctionality = Object.assign(functions, deployedContract);

            return newInstanceWithAddedAdditionalFunctionality;
        }
    }
}

async function generateFunctionsFromSmartContract(contractPath, deployedContract, privateKey, byteCode, network) {
    const functionsDescription = getContractFunctions(contractPath);
    const smartContractTypes = getContractTypes(contractPath);

    let functions = {};

    let fNames = [];
    let fMap = new Map();

    for (func of functionsDescription) {

        const funcName = func.name;
        const funcArgs = func.args;
        const funcReturnType = func.returnType;

        fNames.push(funcName);
        fMap.set(funcName, {
            funcName,
            funcArgs,
            funcReturnType
        });

        const keyPair = await utils.generateKeyPairFromSecretKey(privateKey);
        let currentClient = await utils.getClient(network, keyPair);

        functions[funcName] = async function (args) { // this 'args' is for a hint when user is typing, if it is seeing

            if (arguments.length > 0 && arguments[arguments.length - 1].Chain && arguments[arguments.length - 1].Ae) {
                client = arguments[arguments.length - 1];
            } else {
                client = currentClient;
            }

            const thisFunctionName = funcName;
            const thisFunctionArgs = funcArgs;
            const thisFunctionReturnType = funcReturnType;

            let argsBuilder = '(';

            if (arguments.length > 0) {

                for (let i = 0; i < thisFunctionArgs.length; i++) {

                    let argType = thisFunctionArgs[i].type.toLowerCase();

                    switch (argType) {
                        case 'address':
                            argsBuilder += `${utils.keyToHex(arguments[i])},`
                            break;

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

                        //     // TODO
                        // case 'list(int)':
                        //     break;
                        // case 'list(string)':
                        //     break;
                        // case 'list(bool)':
                        //     break;

                        case 'string':
                        default:
                            argsBuilder += `"${arguments[i]}",`
                            break;
                    }
                }

                if (thisFunctionArgs.length > 0) {
                    // trim last 'comma'
                    argsBuilder = argsBuilder.substr(0, argsBuilder.length - 1);
                }
            }

            argsBuilder += ')';

            // console.log('[ARG BUILDER]');
            // console.log(argsBuilder);

            let amount = 0;
            if (arguments.length > thisFunctionArgs.length) {

                if (arguments[arguments.length - 1].value) {
                    let element = arguments[arguments.length - 1].value;
                    if (element && !isNaN(element)) {
                        amount = parseInt(element);
                    }
                }

                if (arguments.length > 1 && arguments[arguments.length - 2].value) {
                    element = arguments[arguments.length - 2].value;
                    if (element && !isNaN(element)) {
                        amount = parseInt(element);
                    }
                }
            }

            let configuration = {
                args: argsBuilder,
                options: {
                    ttl: ttl,
                    amount: amount
                },
                abi: ABI_TYPE,
            };

            let resultFromExecution = await client.contractCall(byteCode, ABI_TYPE, deployedContract.address, thisFunctionName, configuration);

            let returnType = thisFunctionReturnType;
            for (let _type of smartContractTypes.asList) {
                if (thisFunctionReturnType.indexOf(_type) >= 0) {
                    const syntax = smartContractTypes.asMap.get(_type);
                    returnType = thisFunctionReturnType.trim().replace(_type, syntax);
                } 
            }

            return (await resultFromExecution.decode(returnType.trim())).value;
        }

    }

    functions['from'] = async function (privateKey) {

        const keyPair = await utils.generateKeyPairFromSecretKey(privateKey);
        const client = await utils.getClient(network, keyPair);

        let result = {};
        for (fName of fNames) {

            const name = fName;

            result[name] = async function () {

                const f = functions[name];

                return await f(...arguments, client);
            }
        }

        result['call'] = async function (functionName, options) {

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
            
            return await client.contractCall(byteCode, ABI_TYPE, deployedContract.address, functionName, configuration);
        }

        return result;
    }

    return functions;
}

function getContractTypes(contractPath) {
    let contract = fs.readFileSync(contractPath, 'utf-8');
    let rgx = /^\s*record\s+([\w\d\_]+)\s+=\s(?:{([^}]+))/gm;

    let asMap = new Map();
    let asList = [];

    let match = rgx.exec(contract);
    while (match) {

        // set type name
        let temp = {
            name: match[1],
            syntax: '',
        }

        let isReservedName = temp.name.toLowerCase() === 'state'

        // set syntax
        if (match.length >= 2 && match[2] && !isReservedName) {
            let syntax = processSyntax(match[2]);
            temp.syntax = syntax;
        }

        if (!isReservedName) {
            asMap.set(temp.name, temp.syntax);
            asList.push(temp.name);
        }
        
        match = rgx.exec(contract);
    }

    return {
        asMap,
        asList
    };
}

function processSyntax(unprocessedSyntax) {

    let propValues = unprocessedSyntax.split(',').map(x => x.trim());


    let syntax = `(`;

    for(let propValue of propValues) {

        let tokens = propValue.split(':').map(x => x.trim());
        if (tokens.length >= 2) {
            syntax += tokens[1] + ','
        }
    }

    // trim last comma
    syntax = syntax.substr(0, syntax.length - 1);
    syntax += ')';

    return syntax;
}

function getContractFunctions(contractPath) {
    // add-contract-funcs-to-deployed-contract-instance-#59

    let contract = fs.readFileSync(contractPath, 'utf-8');

    let rgx = /^\s*public\s+(?:stateful\s{1})*function\s+(?:([\w\d\-\_]+)\s{0,1}\(([\w\d\_\-\,\:\s]*)\))\s*(?:\:*\s*([\w\(\)\,\s]+)\s*)*=/gm;

    let matches = [];

    let match = rgx.exec(contract);
    while (match) {

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

function processArguments(args) {
    let splittedArgs = args.split(',').map(x => x.trim());
    let processedArgs = [];

    for (let i = 0; i < splittedArgs.length; i++) {
        let tokens = splittedArgs[i].split(':').map(x => x.trim());
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