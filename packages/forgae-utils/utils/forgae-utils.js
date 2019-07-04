require = require('esm')(module /*, options */) // use to handle es6 import/export 
let axios = require('axios');
const fs = require('fs');
const path = require('path')
const AeSDK = require('@aeternity/aepp-sdk');
const Universal = AeSDK.Universal;
let rgx = /^include\s+\"([a-zA-Z\/\.\-\_]+)\"/gmi;
let dependencyPathrgx = /"([a-zA-Z\/\.\-\_]+)\"/gmi;
const mainContractsPathRgx = /.*\//g;
let dependencies;
let match;

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

async function contractCompile (source, contractPath, compileOptions) {
    let result;
    let options = {
        "file_system": null
    }
    dependencies = {};

    getDependencies(source, contractPath)

    options["file_system"] = dependencies

    let body = {
        code: source,
        options
    };
    
    result = await axios.post(compileOptions.compilerUrl, body, options);

    return result;
}

function getDependencies (contractContent, contractPath) {
    let allDependencies = [];
    let dependencyFromContract;
    let dependencyContractContent;
    let dependencyContractPath;
    let actualContract;

    match = rgx.exec(contractContent)

    if (match == null) {
        return;
    }

    allDependencies = contractContent.match(rgx)
    try {
        for (let index = 0; index < allDependencies.length; index++) {
            dependencyFromContract = dependencyPathrgx.exec(allDependencies[index])
            dependencyPathrgx.lastIndex = 0;

            contractPath = mainContractsPathRgx.exec(contractPath)
            mainContractsPathRgx.lastIndex = 0;
            dependencyContractPath = path.resolve(`${ contractPath[0] }/${ dependencyFromContract[1] }`)
            dependencyContractContent = fs.readFileSync(dependencyContractPath, 'utf-8')
            actualContract = getActualContract(dependencyContractContent)

            if (!dependencies[dependencyFromContract[1]]) {
                dependencies[dependencyFromContract[1]] = actualContract;
            }

            getDependencies(dependencyContractContent, dependencyContractPath)
        }

    } catch (e) {
        return;
    }
    return dependencies;
}

function getActualContract (contractContent) {
    let contentStartIndex = contractContent.indexOf('contract ');
    let content = contractContent.substr(contentStartIndex);

    return content;
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