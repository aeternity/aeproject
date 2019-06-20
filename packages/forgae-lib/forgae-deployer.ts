import utils from 'forgae-utils';
import fs from 'fs';
import logStoreService from 'forgae-logger';
import config from 'forgae-config';
import { KeyPair, ParsedContractFunction, AciFunctions, DeployedContract, Info, TxInfo, Client, ContractInstance, Network } from "./contractTypes";

const decodedHexAddressToPublicAddress = utils.decodedHexAddressToPublicAddress;
let ttl = 100;
const opts = {
    ttl: ttl
};

let client: Client;
let contract: string;

logStoreService.initHistoryRecord();

function getContractName (contract): string {
    let rgx = /contract\s([a-zA-Z0-9]+)\s=/g;
    var match = rgx.exec(contract);

    return match[1];
}

async function getTxInfo (txHash): Promise<TxInfo> {
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

export class Deployer {
    name: string;
    network: Network;
    compilerUrl: string;
    keypair: any;

   /**
    * 
    * @param {string} network 
    * @param {any} keypairOrSecret
    * @param {string} compilerUrl
    */

    constructor(network: string = "local", keypairOrSecret: object = utils.config.keypair, compilerUrl: string = config.compilerUrl) {
        
        this.network = utils.getNetwork(network);
        this.compilerUrl =  compilerUrl;
        
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

    /**
     * 
     * @param {string} path 
     */
    
    async readFile (path: string): Promise<string> {
        return fs.readFileSync(path, "utf-8")
    }

    /**
     * Deploy command
     * @deploy
     * @param {string} contractPath - Relative path to the contract
     * @param {Array} initState - Initial arguments that will be passed to init function.
     * @param {object} options - Initial options that will be passed to init function.
     */
    async deploy(contractPath: string, initState: Array<string | number> = [], options: object = opts): Promise<DeployedContract> {
        
        this.network.compilerUrl = this.compilerUrl;
        client = await utils.getClient(this.network, this.keypair);
        contract = await this.readFile(contractPath);
        
        let contractInstance: ContractInstance;
        let deployedContract: DeployedContract;
        
        let contractFileName: Array<string | number>;
        let txInfo: TxInfo;

        let error: string;
        let isSuccess: boolean = true;
        let info: Info = {
            deployerType: this.constructor.name,
            publicKey: this.keypair.publicKey,
            nameOrLabel: getContractName(contract),
            status: false,
            networkId: this.network.networkId
        }

        try {
            contractInstance = await client.getContractInstance(contract);
            deployedContract = await contractInstance.deploy(initState, options);

            // extract smart contract's functions info, process it and generate function that would be assigned to deployed contract's instance
            let functions = await generateFunctionsFromSmartContract(contract, deployedContract, this.keypair.secretKey, this.network);

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

        function addSmartContractFunctions (deployedContract: DeployedContract, functions: object): DeployedContract {
            let newInstanceWithAddedAdditionalFunctionality = Object.assign(functions, deployedContract);
            return newInstanceWithAddedAdditionalFunctionality;
        }
    }
}

async function generateFunctionsFromSmartContract (contractSource: string, deployedContract: DeployedContract, privateKey: number, network: Network): Promise<Object> {
const functionsDescription: Array<ParsedContractFunction> = parseContractFunctionsFromACI(deployedContract.aci);
    
    const keyPair: KeyPair = await utils.generateKeyPairFromSecretKey(privateKey);
    
    const currentClient : Client = await utils.getClient(network, keyPair);
    
    let functions = {};
    
    let fNames: Array<string> = [];
    let fMap: Map<string, {
        funcName: string,
        funcArgs: Array<number | string | boolean>,
        funcReturnType: number | string | boolean
    }> = new Map();

    for (let func of functionsDescription) {

        const funcName: string = func.name;
        const funcArgs: Array<any> = func.args;
        const funcReturnType: any = func.returnType;

        fNames.push(funcName);
        fMap.set(funcName, {
            funcName,
            funcArgs,
            funcReturnType
        });

        functions[funcName] = async function (args: any) { // this 'args' is for a hint when user is typing, if it is seeing
            
            let client: Client;
            if (arguments.length > 0 && arguments[arguments.length - 1].Chain && arguments[arguments.length - 1].Ae) {
                client = arguments[arguments.length - 1];
            } else {
                client = currentClient;
            }

            const thisFunctionName = funcName;
            const thisFunctionArgs = funcArgs;
            const thisFunctionReturnType = funcReturnType;

            let argsArr: Array<any> = [];
            
            if (arguments.length > 0) {
                
                for (let i = 0; i < thisFunctionArgs.length; i++) {

                    let argType = thisFunctionArgs[i];
                    
                    switch (argType) {
                        case 'address':
                            argsArr.push(`${ arguments[i] }`);
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
            
            let amount: number = 0;
            if (arguments.length > thisFunctionArgs.length) {

                // check is there passed amount/value
                if (arguments[arguments.length - 1].value) {
                    let element: any = arguments[arguments.length - 1].value;
                    
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

            let resultFromExecution: any = await client.contractCall(contractSource, deployedContract.deployInfo.address, thisFunctionName, argsArr, options);
            let returnType: any = thisFunctionReturnType;
            
            let decodedValue = await resultFromExecution.decode(returnType.trim())

            return decodedValue;
        }

    }
    functions['from'] = async function (privateKey: string) {

        const keyPair: KeyPair = await utils.generateKeyPairFromSecretKey(privateKey);
        const client: Client = await utils.getClient(network, keyPair);

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

function parseContractFunctionsFromACI(aci): Array<AciFunctions> {
    let functions: Array<AciFunctions> = [];
    const reservedFunctionNames: Array<string> = [
        'init'
    ]

    for (let func of aci.functions) {

        // skip reserved function's name
        if (reservedFunctionNames.includes(func.name)) {
            continue;
        }
        
        let argsArr: Array<string>= parseACIFunctionArguments(func.arguments);
        let returnType: any = parseACIFunctionReturnType(func.returns);
        
        let parsedFunc: ParsedContractFunction = {
            name: func.name,
            args: argsArr,
            returnType: returnType
        }

        functions.push(parsedFunc);
    }

    return functions;
}

function parseACIFunctionArguments(functionArguments: AciFunctions['arguments']): Array<string> {
    let argsArr: any = functionArguments;

    if (argsArr && argsArr.length !== 0) {
        let tempArgArr = [];

        for (let argInfo of argsArr) {

            let result = _parseACIFunctionArguments(argInfo.type);
            tempArgArr.push(result);
        }

        argsArr = tempArgArr;
    }

    return argsArr;
}

function _parseACIFunctionArguments(argument: any): string {
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

function parseACIFunctionArgumentsList(list: any[]): any {
    
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

function parseACIFunctionArgumentsRecord(record): any {
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

function parseACIFunctionReturnType (functionReturns : any = []): any {
    
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
function processReturnType (array, depth = 1): any {
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
    let recordTemp: Array<any> = [];
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
