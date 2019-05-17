const utils = require('./../utils')
const fs = require('fs');
const logStoreService = require('./../forgae-history/log-store-service');
const config = require('./../config.json');
const decodedHexAddressToPublicAddress = utils.decodedHexAddressToPublicAddress;
let ttl = 100;
const opts = {
    ttl: ttl
};

let client;
let contract;

logStoreService.initHistoryRecord();

function getContractName (contract) {
    let rgx = /contract\s([a-zA-Z0-9]+)\s=/g;
    var match = rgx.exec(contract);

    return match[1];
}

async function getTxInfo (txHash) {
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

    constructor(network = "local", keypairOrSecret = utils.config.keypair, compilerUrl = config.compilerUrl) {
        this.network = utils.getNetwork(network);
        this.compilerUrl = compilerUrl;

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

    async readFile (path) {
        return fs.readFileSync(path, "utf-8")
    }

    /**
     * Deploy command
     * @deploy
     * @param {string} contractPath - Relative path to the contract
     * @param {object} initState - Initial arguments that will be passed to init function.
     * @param {object} options - Initial options that will be passed to init function.
     */
    async deploy(contractPath, initState = [], options = opts) {
        this.network.compilerUrl = this.compilerUrl;
        client = await utils.getClient(this.network, this.keypair);
        contract = await this.readFile(contractPath);

        let contractInstance;
        let deployedContract;
        let contractFileName;
        let txInfo;

        let error;
        let isSuccess = true;
        let info = {
            deployerType: this.constructor.name,
            publicKey: this.keypair.publicKey,
            nameOrLabel: getContractName(contract),
            transactionHash: '',
            status: false,
            gasPrice: '',
            gasUsed: '',
            result: '',
            networkId: this.network.networkId
        }

        try {
            contractInstance = await client.getContractInstance(contract);
            deployedContract = await contractInstance.deploy(initState, options);

            let length = deployedContract.aci.functions.length;

            // console.log(deployedContract.aci);
            // console.log(deployedContract.aci.functions[2].arguments);
            // console.log();

            // console.log('f.arguments');

            for (let f of deployedContract.aci.functions) {
                // console.log(f.arguments);
                // console.log();
            }

            // console.log(deployedContract.aci.functions[length - 3].arguments);
            // console.log(deployedContract.aci.functions[length - 2].arguments);
            // console.log(deployedContract.aci.functions[length - 1]);
            // console.log();
            // console.log(deployedContract.aci.functions[length - 1].arguments);
            // console.log(deployedContract.aci.functions[length - 1].arguments[0].type[0]);
            // console.log(deployedContract.aci.functions[length - 1].arguments[0].type[0].record);

            // console.log();
            // console.log(deployedContract.aci.functions[length - 1].arguments[1].type[0]);
            // console.log(deployedContract.aci.functions[length - 1].arguments[1].type[0].record);

            // extract smart contract's functions info, process it and generate function that would be assigned to deployed contract's instance
            let functions = await generateFunctionsFromSmartContract(contract, deployedContract, this.keypair.secretKey, this.network);

            return;
            deployedContract = addSmartContractFunctions(deployedContract, functions);

            let regex = new RegExp(/[\w]+.aes$/);
            contractFileName = regex.exec(contractPath);
            txInfo = await getTxInfo(deployedContract.deployInfo.transaction);

            if (deployedContract && deployedContract.deployInfo && deployedContract.deployInfo.transaction) {

                info.transactionHash = deployedContract.deployInfo.transaction;
                info.gasPrice = txInfo.gasPrice;
                info.gasUsed = txInfo.gasUsed;
                info.result = deployedContract.deployInfo.address;
                info.status = true;

                console.log(`===== Contract: ${ contractFileName } has been deployed =====`);
            }

        } catch (e) {
            isSuccess = false;
            error = e;
            info.error = e.message;
            info.initState = initState;
            info.options = JSON.stringify(options);
        }

        logStoreService.logAction(info);

        if (!isSuccess) {
            throw new Error(error);
        }

        return deployedContract;

        function addSmartContractFunctions (deployedContract, functions) {
            let newInstanceWithAddedAdditionalFunctionality = Object.assign(functions, deployedContract);

            return newInstanceWithAddedAdditionalFunctionality;
        }
    }
}

async function generateFunctionsFromSmartContract (contractSource, deployedContract, privateKey, network) {
    // const functionsDescription = getContractFunctions(contractSource);
    const functionsDescription = parseContractFunctionsFromACI(deployedContract.aci);
    const smartContractTypes = getContractTypes(contractSource);

    const keyPair = await utils.generateKeyPairFromSecretKey(privateKey);
    const currentClient = await utils.getClient(network, keyPair);

    let functions = {};

    let fNames = [];
    let fMap = new Map();

    // console.log();
    // console.log('=>> old way');

    for (let func of functionsDescription) {

        const funcName = func.name;
        const funcArgs = func.args;
        const funcReturnType = func.returnType;

        // console.log(funcName);
        // console.log(funcArgs);
        // console.log(funcReturnType);
        // console.log();

        fNames.push(funcName);
        fMap.set(funcName, {
            funcName,
            funcArgs,
            funcReturnType
        });

        functions[funcName] = async function (args) { // this 'args' is for a hint when user is typing, if it is seeing

            let client;
            if (arguments.length > 0 && arguments[arguments.length - 1].Chain && arguments[arguments.length - 1].Ae) {
                client = arguments[arguments.length - 1];
            } else {
                client = currentClient;
            }

            const thisFunctionName = funcName;
            const thisFunctionArgs = funcArgs;
            const thisFunctionReturnType = funcReturnType;

            let argsArr = [];

            if (arguments.length > 0) {

                for (let i = 0; i < thisFunctionArgs.length; i++) {

                    // let argType = thisFunctionArgs[i].type.toLowerCase(); // old
                    let argType = thisFunctionArgs[i];

                    switch (argType) {
                        case 'address':
                            argsArr.push(`${ utils.keyToHex(arguments[i]) }`);
                            break;

                        case 'int':
                            argsArr.push(`${ arguments[i] }`);
                            break;

                        case 'bool':
                            argsArr.push(`${ arguments[i] }`);
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
                            argsArr.push(`"${ arguments[i] }"`);
                            break;
                    }
                }

            }

            let amount = 0;
            if (arguments.length > thisFunctionArgs.length) {

                // check is there passed amount/value
                if (arguments[arguments.length - 1].value) {
                    let element = arguments[arguments.length - 1].value;
                    if (element && !isNaN(element)) {
                        amount = parseInt(element);
                    }
                }

                if (arguments.length > 1 && arguments[arguments.length - 2].value) {
                    let element = arguments[arguments.length - 2].value;
                    if (element && !isNaN(element)) {
                        amount = parseInt(element);
                    }
                }

                // check is there passed ttl
                if (arguments[arguments.length - 1].ttl) {
                    let element = arguments[arguments.length - 1].ttl;
                    if (element && !isNaN(element)) {
                        ttl = parseInt(element);
                    }
                }

                if (arguments.length > 1 && arguments[arguments.length - 2].ttl) {
                    let element = arguments[arguments.length - 2].ttl;
                    if (element && !isNaN(element)) {
                        ttl = parseInt(element);
                    }
                }
            }

            let options = {
                amount: amount,
                ttl: ttl
            }

            let resultFromExecution = await client.contractCall(contractSource, deployedContract.deployInfo.address, thisFunctionName, argsArr, options);
            let returnType = thisFunctionReturnType;
            for (let _type of smartContractTypes.asList) {
                if (thisFunctionReturnType.indexOf(_type) >= 0) {
                    const syntax = smartContractTypes.asMap.get(_type);
                    returnType = thisFunctionReturnType.trim().replace(_type, syntax);
                }
            }

            let decodedValue = await resultFromExecution.decode(returnType.trim());

            if (returnType.trim() === 'address') {
                decodedValue.value = decodedHexAddressToPublicAddress(decodedValue.value);
            }

            return decodedValue.value;
        }

    }

    functions['from'] = async function (privateKey) {

        const keyPair = await utils.generateKeyPairFromSecretKey(privateKey);
        const client = await utils.getClient(network, keyPair);

        let result = {};
        for (let fName of fNames) {

            const name = fName;

            result[name] = async function () {

                const f = functions[name];

                return f(...arguments, client);
            }
        }

        result['call'] = async function (functionName, args = [], options = {}) {

            return client.contractCall(contract, deployedContract.deployInfo.address, functionName, args, opts);
        }

        return result;
    }

    return functions;
}

function getContractTypes (contractSource) {
    let rgx = /^\s*record\s+([\w\d\_]+)\s+=\s(?:{([^}]+))/gm;

    let asMap = new Map();
    let asList = [];

    let match = rgx.exec(contractSource);
    while (match) {

        // set type name
        let temp = {
            name: match[1],
            syntax: ''
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

        match = rgx.exec(contractSource);
    }

    return {
        asMap,
        asList
    };
}

function processSyntax (unprocessedSyntax) {

    let propValues = unprocessedSyntax.split(',').map(x => x.trim());

    let syntax = `(`;

    for (let propValue of propValues) {

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





function parseContractFunctionsFromACI (aci) {
    let functions = [];
    const reservedFunctionNames = [
        'init'
    ]

    for (let func of aci.functions) {

        // skip reserved function's name
        if (reservedFunctionNames.includes(func.name)) {
            continue;
        }

        // if (func.name === 'get_todo_by_id') {
        //     console.log('>>>>> get_todo_by_id <<<<<<');
        //     console.log(func);
        //     console.log();
        // }

        let argsArr = parseACIFunctionArguments(func.arguments);
        let returnType = parseACIFunctionReturnType(func.returns);

        let parsedFunc = {
            name: func.name,
            args: argsArr,
            returnType: returnType
        }

        functions.push(parsedFunc);
    }

    // console.log();
    // console.log('functions');
    // console.log(functions);
    // console.log();

    return functions;
}

function parseACIFunctionArguments(functionArguments) {
    let argsArr = functionArguments;

    if (argsArr && argsArr.length !== 0) {
        let tempArgArr = [];

        for (let argInfo of argsArr) {
            
            for (let argType of argInfo.type) {

                let result = _parseACIFunctionArguments(argType);
                tempArgArr.push(result);
            }
        }

        argsArr = tempArgArr;
    }

    return argsArr;
}

function _parseACIFunctionArguments(argument) {
    if (typeof argument === 'string') {
        return argument;
    } else {

        if (argument.record) {
            let result = parseACIFunctionArgumentsRecord(argument.record);
            return result;
        } else if (argument.tuple) {
            return `(${ argument.tuple.toString() })`;
        } else if (argument.list) {
            let result = parseACIFunctionArgumentsList(argument.list);
            return result;
        }
    }
}

function parseACIFunctionArgumentsList(list) {

    let temp = [];

    if (list.length === 1 && typeof list[0] === 'string') {
        temp.push(list[0]);
    } else {

        for (let element of list) {
            let result = _parseACIFunctionArguments(element);
            temp.push(result);
        }
    }

    return `list(${ temp.toString() })`;
}

function parseACIFunctionArgumentsRecord(record) {
    let temp = [];
    for (let value of record) {

        if (value.type.length === 1 && typeof value.type[0] === 'string') {
            temp.push(value.type);
        } else {
            let tempSubArr = [];
            for (let arg of value.type) {
                if (typeof arg === 'string') {
                    tempSubArr.push(arg);
                } else {
                    
                    let result = parseACIFunctionArgumentsRecord(arg.record);
                    // remove brackets
                    result = result.substr(1, result.length - 2);
                    tempSubArr.push(result);
                }
            }

            temp.push(`(${ tempSubArr.toString() })`);
        }
    }

    return `(${ temp.toString() })`;
}

function parseACIFunctionReturnType (functionReturns = []) {
    
    let returnType = functionReturns;
    if (typeof functionReturns !== 'string') {
        if (functionReturns.map) {
            returnType = processReturnType(functionReturns.map);
        } else if (functionReturns.tuple) {
            returnType = processReturnType(functionReturns.tuple);
        } else if (functionReturns.record) {
            returnType = processReturnTypeRecord(functionReturns.record);
        } else if (functionReturns.list) {
            let result = processReturnType(functionReturns.list);
            result = 'list' + result;

            returnType = result;
        }
    }

    return returnType;
}

// depth is just debug helper
function processReturnType (array, depth = 1) {
    let temp = [];
    if (Array.isArray(array) && array.length > 0) {

        for (let element of array) {
            if (typeof element === 'string') {
                temp.push(element)
            } else {
                if (element.map) {
                    temp.push(`${ processReturnType(element.map, depth + 1) }`);
                } else if (element.tuple) {
                    temp.push(`${ processReturnType(element.tuple, depth + 1) }`);
                } else if (element.list) {
                    temp.push(`${ processReturnType(element.list, depth + 1) }`);
                } else if (element.record) {
                    let result = processReturnTypeRecord(element.record);
                    temp.push(result);
                }
            }
        }

        return `(${ temp.toString() })`;
    }

    return temp;
}

// process record
function processReturnTypeRecord (record) {
    let recordTemp = [];
    for (let element of record) {

        for (let recordElement of element.type) {
            if (typeof recordElement === 'string') {
                recordTemp.push(recordElement);
            } else {
                let result = processReturnTypeRecord(recordElement.record);
                recordTemp.push(result);
            }
        }
    }

    return `(${ recordTemp.toString() })`;
}

function getContractFunctions (contractSource) {

    let rgx = /^\s*public\s+(?:stateful\s{1})*function\s+(?:([\w\d\-\_]+)\s{0,1}\(([\w\d\_\-\,\:\s]*)\))\s*(?:\:*\s*([\w\(\)\,\s]+)\s*)*=/gm;

    let matches = [];

    let match = rgx.exec(contractSource);
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
        match = rgx.exec(contractSource);
    }

    return matches;
}

function processArguments (args) {
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