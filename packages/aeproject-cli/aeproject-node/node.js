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
    waitForContainer,
    start,
    stopNode,
    printInfo,
    checkForAllocatedPort,
    printSuccessMsg,
    printStarMsg,
    printInitialStopMsg,
    toggleLoader,
    capitalize
} = require('aeproject-utils');

const utils = require('aeproject-utils');
const fs = require('fs');
const path = require('path');

const nodeConfig = require('aeproject-config')
const config = nodeConfig.config;
const defaultWallets = nodeConfig.defaultWallets;
const nodeConfiguration = nodeConfig.nodeConfiguration;

let balanceOptions = {
    format: false
}
let network = utils.config.localhostParams
network.compilerUrl = utils.config.compilerUrl

const DEFAULT_NODE_PORT = 3001;
const unit = 'node'

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
        throw Error(error);
    }
}

async function fundWallet (client, recipient) {
    await client.spend(config.amountToFund, recipient)
}

function hasNodeConfigFiles () {
    const neededNodeConfigFile = nodeConfiguration.configFileName;
    const nodeConfigFilePath = path.resolve(process.cwd(), neededNodeConfigFile);

    let doesNodeConfigFileExists = fs.existsSync(nodeConfigFilePath);

    if (!doesNodeConfigFileExists) {
        print(`Missing ${ neededNodeConfigFile } file!`);
        return false;
    }

    let nodeFileContent = fs.readFileSync(nodeConfigFilePath, 'utf-8');

    if (nodeFileContent.indexOf(nodeConfiguration.textToSearch) < 0) {
        print(`Invalid ${ neededNodeConfigFile } file!`);
        return false;
    }

    return true;
}

async function run (option) {

    let dockerImage = option.windows ? nodeConfiguration.dockerServiceNodeName : nodeConfiguration.dockerImage;
    dockerImage = nodeConfiguration.dockerServiceNodeName;
    
    try {
        let running = await waitForContainer(dockerImage);
        
        if (option.info) {
            await printInfo(running, capitalize(unit))
            return
        }

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

            printInitialStopMsg(unit)

            try {
                await stopNode();
            } catch (error) {
                printError(Buffer.from(error.stderr).toString('utf-8'))
            }

            return;
        }

        if (!hasNodeConfigFiles()) {
            print('Process will be terminated!');
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

        printStarMsg(unit)
        
        let startingNodeSpawn = start(unit);

        await toggleLoader(startingNodeSpawn, dockerImage)

        printSuccessMsg(unit)

        if (option.windows) {
            let dockerIp = removePrefixFromIp(option.dockerIp);
            await fundWallets(dockerIp);
        } else {
            await fundWallets();
        }

        print('\r\n===== Default wallets were successfully funded! =====');
    } catch (e) {
        printError(e.message || e);
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