/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */
require = require('esm')(module /*, options */) // use to handle es6 import/export

const {
    printError,
    print,
    readSpawnOutput,
    waitForContainer,
    start,
    stopAll,
    stopSeparately,
    info
} = require('aeproject-utils');

const utils = require('aeproject-utils');
const {
    spawn
} = require('promisify-child-process');

const fs = require('fs');
const path = require('path');

const nodeConfig = require('aeproject-config')
const config = nodeConfig.config;
const defaultWallets = nodeConfig.defaultWallets;
const localCompilerConfig = nodeConfig.compilerConfiguration;
const nodeConfiguration = nodeConfig.nodeConfiguration;
let { LogNodeService } = require('aeproject-logger')
let nodeService;

let balanceOptions = {
    format: false
}
let network = utils.config.localhostParams
network.compilerUrl = utils.config.compilerUrl

const MAX_SECONDS_TO_RUN_NODE = 90;
const DEFAULT_NODE_PORT = 3001;
const DEFAULT_COMPILER_PORT = 3080;

async function fundWallets (nodeIp) {
    await waitToMineCoins(nodeIp);

    let walletIndex = 0;

    let client = await utils.getClient(network);
    await printBeneficiaryKey(client);
    for (let wallet in defaultWallets) {
        await fundWallet(client, defaultWallets[wallet].publicKey)
        await printWallet(client, defaultWallets[wallet], `#${ walletIndex++ }`)
    }
}

async function printBeneficiaryKey (client) {
    await printWallet(client, config.keyPair, "Miner")
}

function printSuccessMsg (onlyCompiler) {
    if (onlyCompiler) {
        print('\n\r===== Compiler was successfully started! =====');
        return
    }
    print('\n\r===== Node was successfully started! =====');
    print('===== Funding default wallets! =====');
}

async function printWallet (client, keyPair, label) {
    let keyPairBalance = await client.balance(keyPair.publicKey, balanceOptions)

    print(`${ label } ------------------------------------------------------------`)
    print(`public key: ${ keyPair.publicKey }`)
    print(`private key: ${ keyPair.secretKey }`)
    print(`Wallet's balance is ${ keyPairBalance }`);
}

async function waitToMineCoins (nodeIp) {

    try {
        if (nodeIp) {
            network = JSON.parse(JSON.stringify(network).replace(/localhost/g, nodeIp));
        }

        let client = await utils.getClient(network);
        let heightOptions = {
            interval: 8000,
            attempts: 300
        }
        return await client.awaitHeight(10, heightOptions)
    } catch (error) {
        console.log(error);
        throw Error(error);
    }
}

async function fundWallet (client, recipient) {
    await client.spend(config.amountToFund, recipient)
}

function hasNodeConfigFiles () {
    const neededNodeConfigFile = nodeConfiguration.configFileName;
    const neededCompilerConfigFile = localCompilerConfig.configFileName;
    const nodeConfigFilePath = path.resolve(process.cwd(), neededNodeConfigFile);
    const compilerConfigFilePath = path.resolve(process.cwd(), neededCompilerConfigFile);

    let doesNodeConfigFileExists = fs.existsSync(nodeConfigFilePath);
    let doesCompilerConfigFileExists = fs.existsSync(compilerConfigFilePath);

    if (!doesNodeConfigFileExists || !doesCompilerConfigFileExists) {
        console.log(`Missing ${ neededNodeConfigFile } or ${ neededCompilerConfigFile } file!`);
        return false;
    }

    let nodeFileContent = fs.readFileSync(nodeConfigFilePath, 'utf-8');
    let compilerFileContent = fs.readFileSync(compilerConfigFilePath, 'utf-8');

    if (nodeFileContent.indexOf(nodeConfiguration.textToSearch) < 0 || compilerFileContent.indexOf(localCompilerConfig.textToSearch) < 0) {
        console.log(`Invalid ${ neededNodeConfigFile } or ${ neededCompilerConfigFile } file!`);
        return false;
    }

    return true;
}

async function checkForAllocatedPort (port) {
    try {
        let scanForAllocatedPort = await spawn('lsof', ['-i', `:${ port }`]);

        if (scanForAllocatedPort.stdout) {
            return scanForAllocatedPort.stdout.toString('utf8').length > 0
        }
    } catch (e) {
        // Throws an error when there is no running port. Exceptions are handled elsewhere.
        // console.log(e)
    }

    return false;
}

async function toggleLoader (startingNodeSpawn, image) {
 
    if (startingNodeSpawn.stdout) {
        startingNodeSpawn.stdout.on('data', (data) => {
            print(data.toString());
        });
    }

    let errorMessage = '';
    if (startingNodeSpawn.stderr) {
        startingNodeSpawn.stderr.on('data', (data) => {
            errorMessage += data.toString();
            print(data.toString())
        });
    }

    let counter = 0;
    while (!(await waitForContainer(`${ image }`))) {
        if (errorMessage.indexOf('port is already allocated') >= 0 || errorMessage.indexOf(`address already in use`) >= 0) {
            await stopNodeAndCompiler();
            throw new Error(`Cannot start AE node, port is already allocated!`)
        }

        process.stdout.write(".");
        utils.sleep(1000);

        // prevent infinity loop
        counter++;
        if (counter >= MAX_SECONDS_TO_RUN_NODE) {
            // if node is started and error message is another,
            // we should stop docker

            await stopNodeAndCompiler();
            throw new Error("Cannot start AE Node!")
        }
    }
} 

async function fundWalletsIfNeccessary (option) {
    if (option.onlyCompiler) return

    if (option.windows) {
        let dockerIp = removePrefixFromIp(option.dockerIp);
        await fundWallets(dockerIp);
    } else {
        await fundWallets();
    }

    print('\r\n===== Default wallets was successfully funded! =====');
}

async function printDockerInfo (option, running) {

    if (!running) {
        option.onlyCompiler ? print('===== Compiler is not running! =====') : print('===== Node is not running! =====');
        return
    }
    
    let buff = await info();
    let res = readSpawnOutput(buff)
    
    print(res);
}

async function run (option) {
    nodeService = new LogNodeService(process.cwd());

    let dockerImage = option.windows ? nodeConfiguration.dockerServiceNodeName : nodeConfiguration.dockerImage;
    dockerImage = nodeConfiguration.dockerServiceNodeName;

    // TODO check what is the proper configuration for windows
    let compilerImage = option.onlyCompiler ? nodeConfiguration.dockerServiceCompilerName : nodeConfiguration.dockerImage;
    
    try {
        let running = await waitForContainer(option.onlyCompiler ? compilerImage : dockerImage);
        
        if (option.info) {
            await printDockerInfo(option, running)
            return
        }

        if (option.stop) {

            // if not running, current env may be windows
            // to reduce optional params we check is it running on windows env
            if (!running) {
                running = await waitForContainer(option.onlyCompiler ? compilerImage : dockerImage);
            }

            if (!running) {
                print('===== Node is not running! =====');
                return
            }

            print('===== Stopping node and compiler  =====');

            await stopNodeAndCompiler(option);

            return;
        }

        if (!hasNodeConfigFiles()) {
            console.log('Process will be terminated!');
            return;
        }

        if (running) {
            option.onlyCompiler ? print('\r\n===== Compiler already started and healthy! =====') : print('\r\n===== Node already started and healthy! =====');
            return;
        }

        if (!option.onlyCompiler && await checkForAllocatedPort(DEFAULT_NODE_PORT)) {
            print(`\r\n===== Port [${ DEFAULT_NODE_PORT }] is already allocated! Process will be terminated! =====`);
            throw new Error(`Cannot start AE node, port is already allocated!`);
        }

        if (!option.only && await checkForAllocatedPort(DEFAULT_COMPILER_PORT)) {
            print(`\r\n===== Port [${ DEFAULT_COMPILER_PORT }] is already allocated! Process will be terminated! =====`);
            throw new Error(`Cannot start AE compiler, port is already allocated!`);
        }

        option.onlyCompiler ? print('===== Starting compiler =====') : print('===== Starting node =====');
        let startingNodeSpawn = startNodeAndCompiler(option);

        await toggleLoader(startingNodeSpawn, option.onlyCompiler ? compilerImage : dockerImage)

        printSuccessMsg(option.onlyCompiler)

        await fundWalletsIfNeccessary(option)
    } catch (e) {
        printError(e.message || e);
    }
}

async function startNodeAndCompiler (option) {
    return start(option)
}

async function stopNodeAndCompiler (option) {
    try {
        if (option.stop && (option.only || option.onlyCompiler)) {
            stopSeparately(option)
            return
        }
        
        stopAll();
    } catch (error) {
        console.log(Buffer.from(error.stderr).toString('utf-8'))
    }
}

function removePrefixFromIp (ip) {
    if (!ip) {
        return '';
    }

    return ip.replace('http://', '').replace('https://', '');
}

module.exports = {
    run
}