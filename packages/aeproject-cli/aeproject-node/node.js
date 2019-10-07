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
    waitForContainer
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
    client.addAccount(config.keyPair)
    await printBeneficiaryKey(client);
    for (let wallet in defaultWallets) {
        await fundWallet(client, defaultWallets[wallet].publicKey)
        await printWallet(client, defaultWallets[wallet], `#${ walletIndex++ }`)
    }
}

async function printBeneficiaryKey (client) {
    await printWallet(client, config.keyPair, "Miner")
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
        let scanForAllocatedPort = await spawn('lsof', ['-nP', `-i4TCP:${ port }`]);

        if (scanForAllocatedPort.stdout) {
            return scanForAllocatedPort.stdout.toString('utf8').indexOf(port) >= 0
        }
    } catch (e) {

        // it is throw error when there is no running port
        // console.log(e)
    }

    return false;
}

async function run (option) {
    let dockerImage = option.windows ? nodeConfiguration.dockerServiceNodeName : nodeConfiguration.dockerImage;
    dockerImage = nodeConfiguration.dockerServiceNodeName;

    try {
        let running = await waitForContainer(dockerImage);
        if (option.stop) {

            // if not running, current env may be windows
            // to reduce optional params we check is it running on windows env
            if (!running) {
                running = await waitForContainer(dockerImage);
            }

            if (!running) {
                print('===== Node is not running! =====');
                return
            }

            print('===== Stopping node and compiler  =====');

            await stopNodeAndCompiler();
            print('===== Node was successfully stopped! =====');
            print('===== Compiler was successfully stopped! =====');

            return;
        }

        if (!hasNodeConfigFiles()) {
            console.log('Process will be terminated!');
            return;
        }

        if (running) {
            print('\r\n===== Node already started and healthy! =====');
            return;
        }

        if (await checkForAllocatedPort(DEFAULT_NODE_PORT)) {
            print(`\r\n===== Port [${ DEFAULT_NODE_PORT }] is already allocated! Process will be terminated! =====`);
            throw new Error(`Cannot start AE node, port is already allocated!`);
        }

        if (!option.only && await checkForAllocatedPort(DEFAULT_COMPILER_PORT)) {
            print(`\r\n===== Port [${ DEFAULT_COMPILER_PORT }] is already allocated! Process will be terminated! =====`);
            throw new Error(`Cannot start AE compiler, port is already allocated!`);
        }

        print('===== Starting node =====');
        let startingNodeSpawn = startNodeAndCompiler(option.only);

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
        while (!(await waitForContainer(dockerImage))) {
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

        print('\n\r===== Node was successfully started! =====');
        print('===== Funding default wallets! =====');

        if (option.windows) {
            let dockerIp = removePrefixFromIp(option.dockerIp);
            await fundWallets(dockerIp);
        } else {
            await fundWallets();
        }

        print('\r\n===== Default wallets was successfully funded! =====');
    } catch (e) {
        printError(e.message || e);
    }
}

async function startLocalCompiler () {
    return spawn('docker-compose', ['-f', 'docker-compose.compiler.yml', 'up', '-d']);
}

async function startNodeAndCompiler (startOnlyNode) {

    if (startOnlyNode) {
        return spawn('docker-compose', ['-f', 'docker-compose.yml', 'up', '-d']);
    }

    return spawn('docker-compose', ['-f', 'docker-compose.yml', '-f', 'docker-compose.compiler.yml', 'up', '-d']);
}

async function stopNodeAndCompiler () {
    return spawn('docker-compose', ['-f', 'docker-compose.yml', '-f', 'docker-compose.compiler.yml', 'down', '-v', '--remove-orphans']);
}

function readErrorSpawnOutput (spawnError) {
    const buffMessage = Buffer.from(spawnError.stderr);
    return buffMessage.toString('utf8');
}

function readSpawnOutput (spawnError) {
    const buffMessage = Buffer.from(spawnError.stdout);
    return buffMessage.toString('utf8');
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