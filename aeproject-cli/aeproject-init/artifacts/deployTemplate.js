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

const fs = require('fs');
const { Universal: Ae, MemoryAccount, Node, Crypto } = require('@aeternity/aepp-sdk');
const NETWORKS = require('../config/network.json');
const DEFAULT_NETWORK_NAME = "local";

const deploy = async (secretKey, network, compiler) => {
    if(!secretKey) {
        throw new Error(`Required option missing: secretKey`);
    }
    const KEYPAIR = {
        secretKey: secretKey,
        publicKey: Crypto.getAddressFromPriv(secretKey)
    }
    const NETWORK_NAME = network ? network : DEFAULT_NETWORK_NAME;

    const account = MemoryAccount({ keypair: KEYPAIR });
    const node = await Node({ url: NETWORKS[NETWORK_NAME].nodeUrl, internalUrl: NETWORKS[NETWORK_NAME].nodeUrl });

    const client = await Ae({
        nodes: [
            { name: NETWORK_NAME, instance: node },
        ],
        compilerUrl: compiler ? compiler : NETWORKS[NETWORK_NAME].compilerUrl,
        accounts: [account],
        address: KEYPAIR.publicKey
    });

    const EXAMPLE_CONTRACT = fs.readFileSync('./contracts/ExampleContract.aes', 'utf8');
    contract = await client.getContractInstance(EXAMPLE_CONTRACT);
    const deploymentResult = await contract.deploy([]);
    console.log(deploymentResult);
};

module.exports = {
    deploy
};