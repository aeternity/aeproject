"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const network_1 = require("./network");
const forgae_utils_1 = __importDefault(require("forgae-utils"));
const fs_1 = __importDefault(require("fs"));
const forgae_logger_1 = __importDefault(require("forgae-logger"));
const forgae_config_1 = __importDefault(require("forgae-config"));
const decodedHexAddressToPublicAddress = forgae_utils_1.default.decodedHexAddressToPublicAddress;
let ttl = 100;
const opts = {
    ttl: ttl
};
let client;
let contract;
forgae_logger_1.default.initHistoryRecord();
function getContractName(contract) {
    let rgx = /contract\s([a-zA-Z0-9]+)\s=/g;
    var match = rgx.exec(contract);
    return match[1];
}
function getTxInfo(txHash) {
    return __awaiter(this, void 0, void 0, function* () {
        let result;
        try {
            result = yield client.getTxInfo(txHash);
        }
        catch (error) {
            let info = {
                gasUsed: 0,
                gasPrice: 0
            };
            return info;
        }
        return result;
    });
}
class Deployer {
    /**
     *
     * @param {string} network
     * @param {any} keypairOrSecret
     * @param {string} compilerUrl
     */
    constructor(network = "local", keypairOrSecret = forgae_utils_1.default.config.keypair, compilerUrl = forgae_config_1.default.compilerUrl) {
        this.network = new network_1.Network(network);
        this.compilerUrl = new URL(compilerUrl).origin;
        if (forgae_utils_1.default.isKeyPair(keypairOrSecret)) {
            this.keypair = keypairOrSecret;
            return;
        }
        if (typeof keypairOrSecret === 'string' || keypairOrSecret instanceof String) {
            this.keypair = {
                publicKey: forgae_utils_1.default.generatePublicKeyFromSecretKey(keypairOrSecret),
                secretKey: keypairOrSecret
            };
            return;
        }
        throw new Error("Incorrect keypair or secret key passed");
    }
    /**
     *
     * @param {string} path
     */
    readFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return fs_1.default.readFileSync(path, "utf-8");
        });
    }
    /**
     * Deploy command
     * @deploy
     * @param {string} contractPath - Relative path to the contract
     * @param {Array} initState - Initial arguments that will be passed to init function.
     * @param {object} options - Initial options that will be passed to init function.
     */
    deploy(contractPath, initState = [], options = opts) {
        return __awaiter(this, void 0, void 0, function* () {
            this.network.compilerUrl = this.compilerUrl;
            client = yield forgae_utils_1.default.getClient(this.network, this.keypair);
            contract = yield this.readFile(contractPath);
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
                status: false,
                networkId: this.network.networkId
            };
            try {
                contractInstance = yield client.getContractInstance(contract);
                deployedContract = yield contractInstance.deploy(initState, options);
                // extract smart contract's functions info, process it and generate function that would be assigned to deployed contract's instance
                let functions = yield generateFunctionsFromSmartContract(contract, deployedContract, this.keypair.secretKey, this.network);
                deployedContract = addSmartContractFunctions(deployedContract, functions);
                let regex = new RegExp(/[\w]+.aes$/);
                contractFileName = regex.exec(contractPath);
                txInfo = yield getTxInfo(deployedContract.deployInfo.transaction);
                if (deployedContract && deployedContract.deployInfo && deployedContract.deployInfo.transaction) {
                    info.transactionHash = deployedContract.deployInfo.transaction;
                    info.gasPrice = txInfo.gasPrice;
                    info.gasUsed = txInfo.gasUsed;
                    info.result = deployedContract.deployInfo.address;
                    info.status = true;
                    console.log(`===== Contract: ${contractFileName} has been deployed =====`);
                }
            }
            catch (e) {
                isSuccess = false;
                error = e;
                info.error = e.message;
                info.initState = initState;
                info.options = JSON.stringify(options);
            }
            forgae_logger_1.default.logAction(info);
            if (!isSuccess) {
                throw new Error(error);
            }
            return deployedContract;
            function addSmartContractFunctions(deployedContract, functions) {
                let newInstanceWithAddedAdditionalFunctionality = Object.assign(functions, deployedContract);
                return newInstanceWithAddedAdditionalFunctionality;
            }
        });
    }
}
exports.Deployer = Deployer;
function generateFunctionsFromSmartContract(contractSource, deployedContract, privateKey, network) {
    return __awaiter(this, void 0, void 0, function* () {
        const functionsDescription = parseContractFunctionsFromACI(deployedContract.aci);
        const keyPair = yield forgae_utils_1.default.generateKeyPairFromSecretKey(privateKey);
        const currentClient = yield forgae_utils_1.default.getClient(network, keyPair);
        let functions = {};
        let fNames = [];
        let fMap = new Map();
        for (let func of functionsDescription) {
            const funcName = func.name;
            const funcArgs = func.args;
            const funcReturnType = func.returnType;
            fNames.push(funcName);
            fMap.set(funcName, {
                funcName,
                funcArgs,
                funcReturnType
            });
            functions[funcName] = function (args) {
                return __awaiter(this, arguments, void 0, function* () {
                    let client;
                    if (arguments.length > 0 && arguments[arguments.length - 1].Chain && arguments[arguments.length - 1].Ae) {
                        client = arguments[arguments.length - 1];
                    }
                    else {
                        client = currentClient;
                    }
                    const thisFunctionName = funcName;
                    const thisFunctionArgs = funcArgs;
                    const thisFunctionReturnType = funcReturnType;
                    let argsArr = [];
                    if (arguments.length > 0) {
                        for (let i = 0; i < thisFunctionArgs.length; i++) {
                            let argType = thisFunctionArgs[i];
                            switch (argType) {
                                case 'address':
                                    argsArr.push(`${forgae_utils_1.default.keyToHex(arguments[i])}`);
                                    break;
                                case 'int':
                                    argsArr.push(`${arguments[i]}`);
                                    break;
                                case 'bool':
                                    argsArr.push(`${arguments[i]}`);
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
                                    argsArr.push(`"${arguments[i]}"`);
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
                    };
                    let resultFromExecution = yield client.contractCall(contractSource, deployedContract.deployInfo.address, thisFunctionName, argsArr, options);
                    let returnType = thisFunctionReturnType;
                    let decodedValue = yield resultFromExecution.decode(returnType.trim());
                    if (returnType.trim() === 'address') {
                        decodedValue.value = decodedHexAddressToPublicAddress(decodedValue.value);
                    }
                    return decodedValue.value;
                });
            };
        }
        functions['from'] = function (privateKey) {
            return __awaiter(this, void 0, void 0, function* () {
                const keyPair = yield forgae_utils_1.default.generateKeyPairFromSecretKey(privateKey);
                const client = yield forgae_utils_1.default.getClient(network, keyPair);
                let result = {};
                for (let fName of fNames) {
                    const name = fName;
                    result[name] = function () {
                        return __awaiter(this, arguments, void 0, function* () {
                            const f = functions[name];
                            return f(...arguments, client);
                        });
                    };
                }
                result['call'] = function (functionName, args = [], options = {}) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return client.contractCall(contract, deployedContract.deployInfo.address, functionName, args, opts);
                    });
                };
                return result;
            });
        };
        return functions;
    });
}
function parseContractFunctionsFromACI(aci) {
    let functions = [];
    const reservedFunctionNames = [
        'init'
    ];
    for (let func of aci.functions) {
        // skip reserved function's name
        if (reservedFunctionNames.includes(func.name)) {
            continue;
        }
        let argsArr = parseACIFunctionArguments(func.arguments);
        let returnType = parseACIFunctionReturnType(func.returns);
        let parsedFunc = {
            name: func.name,
            args: argsArr,
            returnType: returnType
        };
        functions.push(parsedFunc);
    }
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
    }
    else {
        if (argument.record) {
            let result = parseACIFunctionArgumentsRecord(argument.record);
            return result;
        }
        else if (argument.tuple) {
            return `(${argument.tuple.toString()})`;
        }
        else if (argument.list) {
            let result = parseACIFunctionArgumentsList(argument.list);
            return result;
        }
    }
}
function parseACIFunctionArgumentsList(list) {
    let temp = [];
    if (list.length === 1 && typeof list[0] === 'string') {
        temp.push(list[0]);
    }
    else {
        for (let element of list) {
            let result = _parseACIFunctionArguments(element);
            temp.push(result);
        }
    }
    return `list(${temp.toString()})`;
}
function parseACIFunctionArgumentsRecord(record) {
    let temp = [];
    for (let value of record) {
        if (value.type.length === 1 && typeof value.type[0] === 'string') {
            temp.push(value.type);
        }
        else {
            let tempSubArr = [];
            for (let arg of value.type) {
                if (typeof arg === 'string') {
                    tempSubArr.push(arg);
                }
                else {
                    let result = parseACIFunctionArgumentsRecord(arg.record);
                    // remove brackets
                    result = result.substr(1, result.length - 2);
                    tempSubArr.push(result);
                }
            }
            temp.push(`(${tempSubArr.toString()})`);
        }
    }
    return `(${temp.toString()})`;
}
function parseACIFunctionReturnType(functionReturns = []) {
    let returnType = functionReturns;
    if (typeof functionReturns !== 'string') {
        if (functionReturns.map) {
            returnType = processReturnType(functionReturns.map);
        }
        else if (functionReturns.tuple) {
            returnType = processReturnType(functionReturns.tuple);
        }
        else if (functionReturns.record) {
            returnType = processReturnTypeRecord(functionReturns.record);
        }
        else if (functionReturns.list) {
            let result = processReturnType(functionReturns.list);
            result = 'list' + result;
            returnType = result;
        }
    }
    return returnType;
}
// depth is just debug helper
function processReturnType(array, depth = 1) {
    let temp = [];
    if (Array.isArray(array) && array.length > 0) {
        for (let element of array) {
            if (typeof element === 'string') {
                temp.push(element);
            }
            else {
                if (element.map) {
                    temp.push(`${processReturnType(element.map, depth + 1)}`);
                }
                else if (element.tuple) {
                    temp.push(`${processReturnType(element.tuple, depth + 1)}`);
                }
                else if (element.list) {
                    temp.push(`${processReturnType(element.list, depth + 1)}`);
                }
                else if (element.record) {
                    let result = processReturnTypeRecord(element.record);
                    temp.push(result);
                }
            }
        }
        return `(${temp.toString()})`;
    }
    return temp;
}
// process record
function processReturnTypeRecord(record) {
    let recordTemp = [];
    for (let element of record) {
        for (let recordElement of element.type) {
            if (typeof recordElement === 'string') {
                recordTemp.push(recordElement);
            }
            else {
                let result = processReturnTypeRecord(recordElement.record);
                recordTemp.push(result);
            }
        }
    }
    return `(${recordTemp.toString()})`;
}
//# sourceMappingURL=forgae-deployer.js.map