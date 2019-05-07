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
const Ae = require('@aeternity/aepp-sdk').Universal;

const config = {
    host: "http://localhost:3001/",
    internalHost: "http://localhost:3001/internal/",
    gas: 200000,
    ttl: 55,
    compilerUrl: 'https://compiler.aepps.com'
}

describe('Example Contract', () => {

    let owner;
    let options = {
        ttl: config.ttl
    }

    before(async () => {
        const ownerKeyPair = wallets[0];
        owner = await Ae({
            url: config.host,
            internalUrl: config.internalHost,
            keypair: ownerKeyPair,
            nativeMode: true,
            networkId: 'ae_devnet',
            compilerUrl: config.compilerUrl
        });

    })

    it('Deploying Example Contract', async () => {
        let contractSource = utils.readFileRelative('./contracts/ExampleContract.aes', "utf-8"); // Read the aes file

        const compiledContract = await owner.contractCompile(contractSource, { // Compile it
        })
        // Deploy it
        // [] - empty init state object
        const deployPromise = compiledContract.deploy([], options);

        await assert.isFulfilled(deployPromise, 'Could not deploy the ExampleContract Smart Contract'); // Check it is deployed
    })

})