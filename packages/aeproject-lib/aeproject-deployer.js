"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var aeproject_utils_1 = require("aeproject-utils");
var fs = require("fs");
var aeproject_logger_1 = require("aeproject-logger");
var aeproject_config_1 = require("aeproject-config");
var aeproject_config_2 = require("aeproject-config");
var decodedHexAddressToPublicAddress = aeproject_utils_1.default.decodedHexAddressToPublicAddress;
var ttl = 100;
var opts = {
    ttl: ttl
};
var client;
var contract;
var instances;
var instancesMap = {};
aeproject_logger_1.default.initHistoryRecord();
function getContractName(contract) {
    var rgx = /contract\s([a-zA-Z0-9]+)\s=/g;
    var match = rgx.exec(contract);
    return match[1];
}
function getTxInfo(txHash) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_1, info;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, client.getTxInfo(txHash)];
                case 1:
                    result = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    info = {
                        gasUsed: 0,
                        gasPrice: 0
                    };
                    return [2 /*return*/, info];
                case 3: return [2 /*return*/, result];
            }
        });
    });
}
var Deployer = /** @class */ (function () {
    /**
     *
     * @param {string} network
     * @param {any} keypairOrSecret
     * @param {string} compilerUrl
     */
    function Deployer(network, keypairOrSecret, compilerUrl, networkId) {
        if (network === void 0) { network = "local"; }
        if (keypairOrSecret === void 0) { keypairOrSecret = aeproject_utils_1.default.config.keypair; }
        if (compilerUrl === void 0) { compilerUrl = aeproject_config_1.default.compilerUrl; }
        this.network = aeproject_utils_1.default.getNetwork(network, networkId);
        this.compilerUrl = compilerUrl;
        if (aeproject_utils_1.default.isKeyPair(keypairOrSecret)) {
            this.keypair = keypairOrSecret;
            return;
        }
        if (typeof keypairOrSecret === 'string' || keypairOrSecret instanceof String) {
            this.keypair = {
                publicKey: aeproject_utils_1.default.generatePublicKeyFromSecretKey(keypairOrSecret),
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
    Deployer.prototype.readFile = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, fs.readFileSync(path, "utf-8")];
            });
        });
    };
    /**
     * Deploy command
     * @deploy
     * @param {string} contractPath - Relative path to the contract
     * @param {Array} initState - Initial arguments that will be passed to init function.
     * @param {object} options - Initial options that will be passed to init function.
     */
    Deployer.prototype.deploy = function (contractPath, initState, options) {
        if (initState === void 0) { initState = []; }
        if (options === void 0) { options = opts; }
        return __awaiter(this, void 0, void 0, function () {
            function addSmartContractFunctions(deployedContract, contractInstanceWrapperFuncs) {
                var newInstanceWithAddedAdditionalFunctionality = Object.assign(contractInstanceWrapperFuncs, deployedContract);
                return newInstanceWithAddedAdditionalFunctionality;
            }
            var contractInstance, deployedContract, contractFileName, txInfo, error, isSuccess, info, contractInstanceWrapperFuncs, regex, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.network.compilerUrl = this.compilerUrl;
                        return [4 /*yield*/, aeproject_utils_1.default.getClient(this.network, this.keypair)];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, this.readFile(contractPath)];
                    case 2:
                        contract = _a.sent();
                        isSuccess = true;
                        info = {
                            deployerType: this.constructor.name,
                            publicKey: this.keypair.publicKey,
                            nameOrLabel: getContractName(contract),
                            status: false,
                            networkId: this.network.networkId
                        };
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 9, , 10]);
                        return [4 /*yield*/, client.getContractInstance(contract)];
                    case 4:
                        contractInstance = _a.sent();
                        return [4 /*yield*/, contractInstance.deploy(initState, options)];
                    case 5:
                        deployedContract = _a.sent();
                        // extract smart contract's functions info, process it and generate function that would be assigned to deployed contract's instance
                        return [4 /*yield*/, generateInstancesWithWallets(this.network, deployedContract.address)];
                    case 6:
                        // extract smart contract's functions info, process it and generate function that would be assigned to deployed contract's instance
                        _a.sent();
                        return [4 /*yield*/, generateFunctionsFromSmartContract(contractInstance)];
                    case 7:
                        contractInstanceWrapperFuncs = _a.sent();
                        deployedContract = addSmartContractFunctions(deployedContract, contractInstanceWrapperFuncs);
                        regex = new RegExp(/[\w]+.aes$/);
                        contractFileName = regex.exec(contractPath);
                        return [4 /*yield*/, getTxInfo(deployedContract.transaction)];
                    case 8:
                        txInfo = _a.sent();
                        if (deployedContract && deployedContract.transaction) {
                            info.transactionHash = deployedContract.transaction;
                            info.gasPrice = txInfo.gasPrice;
                            info.gasUsed = txInfo.gasUsed;
                            info.result = deployedContract.address;
                            info.status = true;
                            console.log("===== Contract: " + contractFileName + " has been deployed at " + deployedContract.address + " =====");
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        e_1 = _a.sent();
                        isSuccess = false;
                        error = e_1;
                        info.error = e_1.message;
                        info.initState = initState;
                        info.options = JSON.stringify(options);
                        return [3 /*break*/, 10];
                    case 10:
                        aeproject_logger_1.default.logAction(info);
                        if (!isSuccess) {
                            throw new Error(error);
                        }
                        return [2 /*return*/, deployedContract];
                }
            });
        });
    };
    return Deployer;
}());
exports.Deployer = Deployer;
function generateInstancesWithWallets(network, contractAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _i, wallet, currentClient, contractInstance;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    instances = [];
                    _a = [];
                    for (_b in aeproject_config_2.default.defaultWallets)
                        _a.push(_b);
                    _i = 0;
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    wallet = _a[_i];
                    return [4 /*yield*/, aeproject_utils_1.default.getClient(network, aeproject_config_2.default.defaultWallets[wallet])];
                case 2:
                    currentClient = _c.sent();
                    return [4 /*yield*/, currentClient.getContractInstance(contract, { contractAddress: contractAddress })];
                case 3:
                    contractInstance = _c.sent();
                    instances.push(contractInstance);
                    instancesMap[aeproject_config_2.default.defaultWallets[wallet].publicKey] = contractInstance;
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function generateFunctionsFromSmartContract(contractInstance) {
    return __awaiter(this, void 0, void 0, function () {
        var contractFunctions;
        return __generator(this, function (_a) {
            contractFunctions = contractInstance.methods;
            contractFunctions['from'] = function (userWallet) {
                return __awaiter(this, void 0, void 0, function () {
                    var walletToPass, keyPair;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                walletToPass = userWallet;
                                if (walletToPass.secretKey) {
                                    walletToPass = walletToPass.secretKey;
                                }
                                return [4 /*yield*/, aeproject_utils_1.default.generateKeyPairFromSecretKey(walletToPass)];
                            case 1:
                                keyPair = _a.sent();
                                return [2 /*return*/, instancesMap[keyPair.publicKey].methods];
                        }
                    });
                });
            };
            return [2 /*return*/, contractFunctions];
        });
    });
}
//# sourceMappingURL=aeproject-deployer.js.map