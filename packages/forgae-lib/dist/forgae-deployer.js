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
const forgae_utils_1 = __importDefault(require("forgae-utils"));
const fs_1 = __importDefault(require("fs"));
const forgae_logger_1 = __importDefault(require("forgae-logger"));
const forgae_config_1 = __importDefault(require("forgae-config"));
const forgae_config_2 = __importDefault(require("forgae-config"));
const decodedHexAddressToPublicAddress = forgae_utils_1.default.decodedHexAddressToPublicAddress;
let ttl = 100;
const opts = {
    ttl: ttl
};
let client;
let contract;
let instances;
let instancesMap = {};
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
    constructor(network = "local", keypairOrSecret = forgae_utils_1.default.config.keypair, compilerUrl = forgae_config_1.default.compilerUrl, networkId) {
        this.network = forgae_utils_1.default.getNetwork(network, networkId);
        this.compilerUrl = compilerUrl;
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
                yield generateInstancesWithWallets(this.network, deployedContract.address);
                let contractInstanceWrapperFuncs = yield generateFunctionsFromSmartContract(contractInstance);
                deployedContract = addSmartContractFunctions(deployedContract, contractInstanceWrapperFuncs);
                let regex = new RegExp(/[\w]+.aes$/);
                contractFileName = regex.exec(contractPath);
                txInfo = yield getTxInfo(deployedContract.transaction);
                if (deployedContract && deployedContract.transaction) {
                    info.transactionHash = deployedContract.transaction;
                    info.gasPrice = txInfo.gasPrice;
                    info.gasUsed = txInfo.gasUsed;
                    info.result = deployedContract.address;
                    info.status = true;
                    console.log(`===== Contract: ${ contractFileName } has been deployed at ${ deployedContract.address } =====`);
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
            function addSmartContractFunctions(deployedContract, contractInstanceWrapperFuncs) {
                let newInstanceWithAddedAdditionalFunctionality = Object.assign(contractInstanceWrapperFuncs, deployedContract);
                return newInstanceWithAddedAdditionalFunctionality;
            }
        });
    }
}
exports.Deployer = Deployer;
function generateInstancesWithWallets(network, contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        instances = [];
        for (let wallet in forgae_config_2.default.defaultWallets) {
            let currentClient = yield forgae_utils_1.default.getClient(network, forgae_config_2.default.defaultWallets[wallet]);
            let contractInstance = yield currentClient.getContractInstance(contract, { contractAddress });
            instances.push(contractInstance);
            instancesMap[forgae_config_2.default.defaultWallets[wallet].publicKey] = contractInstance;
        }
    });
}
function generateFunctionsFromSmartContract(contractInstance) {
    return __awaiter(this, void 0, void 0, function* () {
        let contractFunctions = contractInstance.methods;
        contractFunctions['from'] = function (userWallet) {
            return __awaiter(this, void 0, void 0, function* () {
                let walletToPass = userWallet;
                if (walletToPass.secretKey) {
                    walletToPass = walletToPass.secretKey;
                }
                const keyPair = yield forgae_utils_1.default.generateKeyPairFromSecretKey(walletToPass);
                return instancesMap[keyPair.publicKey].methods;
            });
        };
        return contractFunctions;
    });
}
//# sourceMappingURL=forgae-deployer.js.map