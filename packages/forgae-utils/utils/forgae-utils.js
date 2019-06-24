require = require('esm')(module /*, options */) // use to handle es6 import/export 
const AeSDK = require('@aeternity/aepp-sdk');
const Universal = AeSDK.Universal;
const ContractCompilerAPI = AeSDK.ContractCompilerAPI;

const config = require('forgae-config');
const {
    printError
} = require('./fs-utils')

const {
    spawn
} = require('promisify-child-process');

const getClient = async function (network, keypair = config.keypair) {
    let client;
    let internalUrl = network.url;

    if (network.url.includes("localhost")) {
        internalUrl = internalUrl + "/internal"
    }
    await handleApiError(async () => {
        client = await Universal({
            url: network.url,
            internalUrl,
            keypair: keypair,
            nativeMode: true,
            networkId: network.networkId,
            compilerUrl: network.compilerUrl
        })
    });

    return client;
}

const getNetwork = (network, networkId) => {
    if (networkId) {
        const customNetwork = createCustomNetwork(network, networkId)
        return customNetwork;
    }
    const networks = {
        local: {
            url: config.localhostParams.url,
            networkId: config.localhostParams.networkId
        },
        testnet: {
            url: config.testNetParams.url,
            networkId: config.testNetParams.networkId
        },
        mainnet: {
            url: config.mainNetParams.url,
            networkId: config.mainNetParams.networkId
        }
    };

    const result = networks[network] != undefined ? networks[network] : createCustomNetwork(network, networkId);

    return result
};

const createCustomNetwork = (network, networkId) => {

    if (network.includes('local') || networkId == undefined) {
        throw new Error('Both network and networkId should be passed')
    }
    const customNetork = {
        url: network,
        networkId: networkId
    }

    return customNetork;
}

const handleApiError = async (fn) => {
    try {

        return await fn()
    } catch (e) {
        const response = e.response
        logApiError(response && response.data ? response.data.reason : e)
        process.exit(1)
    }
};

function logApiError (error) {
    printError(`API ERROR: ${ error }`)
}

const sleep = (ms) => {
    var start = Date.now();
    while (true) {
        var clock = (Date.now() - start);
        if (clock >= ms) break;
    }
}

const forgaeExecute = async (command, args = [], options = {}) => {
    return execute("forgae", command, args, options)
}

const execute = async (cli, command, args = [], options = {}) => {

    try {
        const child = await spawn(cli, [command, ...args], options);

        let result = readSpawnOutput(child);
        if (!result) {
            result = readErrorSpawnOutput(child);
        }

        return result;
    } catch (e) {
        let result = readSpawnOutput(e);
        result += readErrorSpawnOutput(e);

        return result;
    }
};

const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

function readErrorSpawnOutput (spawnResult) {
    if (!spawnResult.stderr || spawnResult.stderr === '') {
        return '';
    }

    const buffMessage = Buffer.from(spawnResult.stderr);
    return '\n' + buffMessage.toString('utf8');
}

function readSpawnOutput (spawnResult) {
    if (!spawnResult.stdout || spawnResult.stdout === '') {
        return '';
    }

    const buffMessage = Buffer.from(spawnResult.stdout);
    return buffMessage.toString('utf8');
}

async function contractCompile (source, options) {
    const compiler = await ContractCompilerAPI(options);
    return compiler.compileContractAPI(source);
}

module.exports = {
    config,
    getClient,
    getNetwork,
    handleApiError,
    logApiError,
    sleep,
    forgaeExecute,
    execute,
    timeout,
    contractCompile
}