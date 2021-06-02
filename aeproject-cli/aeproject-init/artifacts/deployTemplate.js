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
const { Universal, MemoryAccount, Node, Crypto } = require('@aeternity/aepp-sdk');
const contractUtils = require('../utils/contract-utils');

const NETWORKS = require('../config/network.json');
const DEFAULT_NETWORK_NAME = 'local';

const EXAMPLE_CONTRACT_SOURCE = './contracts/ExampleContract.aes';

const deploy = async (secretKey, network, compiler) => {
    if(!secretKey) {
        throw new Error(`Required option missing: secretKey`);
    }
    const KEYPAIR = {
        secretKey: secretKey,
        publicKey: Crypto.getAddressFromPriv(secretKey)
    }
    const NETWORK_NAME = network ? network : DEFAULT_NETWORK_NAME;

    const client = await Universal({
        nodes: [
            { name: NETWORK_NAME, instance: await Node({ url: NETWORKS[NETWORK_NAME].nodeUrl }) },
        ],
        compilerUrl: compiler ? compiler : NETWORKS[NETWORK_NAME].compilerUrl,
        accounts: [MemoryAccount({ keypair: KEYPAIR })],
        address: KEYPAIR.publicKey
    });
    // a filesystem object must be passed to the compiler if the contract uses custom includes
    const filesystem = contractUtils.getFilesystem(EXAMPLE_CONTRACT_SOURCE);
    // get content of contract
    const contract_content = contractUtils.getContractContent(EXAMPLE_CONTRACT_SOURCE);
    contract = await client.getContractInstance(contract_content, {filesystem});
    const deployment_result = await contract.deploy([]);
    console.log(deployment_result);
};

module.exports = {
    deploy
};