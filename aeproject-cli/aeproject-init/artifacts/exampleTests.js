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
const fs = require('fs')
const { Universal: Ae, MemoryAccount, Node } = require('@aeternity/aepp-sdk');

const EXAMPLE_CONTRACT = fs.readFileSync('./contracts/ExampleContract.aes', 'utf8')
const NETWORKS = require('../config/network.json');
const NETWORK_NAME = "LOCAL";

describe('Example Contract', () => {
    let contract;
    let hamsterName;

    before(async () => {
        const account = MemoryAccount({ keypair: wallets[0] });
        const node = await Node({ url: NETWORKS[NETWORK_NAME].nodeUrl, internalUrl: NETWORKS[NETWORK_NAME].nodeUrl });
        const client = await Ae({
            nodes: [
              { name: NETWORK_NAME, instance: node },
            ],
            compilerUrl: NETWORKS[NETWORK_NAME].compilerUrl,
            accounts: [account],
            address: wallets[0].publicKey
        });
        contract = await client.getContractInstance(EXAMPLE_CONTRACT); // Get contract instance
    })

    it('Deploying Example Contract', async () => {
        const deployedPromise = contract.deploy([]); // Deploy contract

        await assert.isFulfilled(deployedPromise, 'Could not deploy the ExampleContract Smart Contract'); // Check whether contract is deployed
        await Promise.resolve(deployedPromise);
    })

    it('Should check if hamster has been created', async () => {
        hamsterName = 'C.Hamster';
        await contract.methods.createHamster(hamsterName);
        let result = await contract.methods.nameExists(hamsterName);
        assert.isTrue(result.decodedResult, 'hamster has not been created');
    })

    it('Should REVERT if hamster already exists', async () => {
        await assert.isRejected(contract.methods.createHamster('C.Hamster'))
    })

    it('Should return false if name does not exist', async () => {
        hamsterName = 'DoesHamsterExists';
        let result = await contract.methods.nameExists(hamsterName);
        assert.isOk(!result.decodedResult);
    })

    it('Should return true if the name exists', async () => {
        hamsterName = 'DoesHamsterExists';
        await contract.methods.createHamster(hamsterName)
        let result = await contract.methods.nameExists(hamsterName);
        assert.isOk(result.decodedResult)
    })
})