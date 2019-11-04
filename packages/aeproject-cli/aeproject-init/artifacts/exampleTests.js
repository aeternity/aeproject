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

const Deployer = require('aeproject-lib').Deployer;
const EXAMPLE_CONTRACT_PATH = "./contracts/ExampleContract.aes";

describe('Example Contract', () => {

    let deployer;
    let instance;
    let ownerKeyPair = wallets[0];
    let hamsterName;

    before(async () => {
        deployer = new Deployer('local', ownerKeyPair.secretKey)
    })

    it('Deploying Example Contract', async () => {
        const deployedPromise = deployer.deploy(EXAMPLE_CONTRACT_PATH) // Deploy it

        await assert.isFulfilled(deployedPromise, 'Could not deploy the ExampleContract Smart Contract'); // Check whether it's deployed
        instance = await Promise.resolve(deployedPromise)
    })

    it('Should check if hamster has been created', async () => {
        hamsterName = 'C.Hamster';
        await instance.createHamster(hamsterName)

        let exists = (await instance.nameExists(hamsterName)).decodedResult

        assert.isTrue(exists, 'hamster has not been created')
    })

    it('Should REVERT if hamster already exists', async () => {
        await assert.isRejected(instance.createHamster('C.Hamster'))
    })

    it('Should return false if name does not exist', async () => {
        hamsterName = 'DoesHamsterExists';
        let exists = (await instance.nameExists(hamsterName)).decodedResult

        assert.isOk(!exists)
    })

    it('Should return true if the name exists', async () => {
        hamsterName = 'DoesHamsterExists';

        await instance.createHamster(hamsterName)

        let exists = (await instance.nameExists(hamsterName)).decodedResult

        assert.isOk(exists)
    })
})