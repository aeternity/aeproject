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

const AeSDK = require('@aeternity/aepp-sdk');
const Universal = AeSDK.Universal;
const Node = AeSDK.Node;

const fs = require('fs');

const contractSource = fs.readFileSync(EXAMPLE_CONTRACT_PATH, 'utf8');

describe('Example Contract', () => {

    let deployer;
    let instance;
    let ownerKeyPair = wallets[0];
    let hamsterName;

    before(async () => {
        let keyPair = { 
            publicKey: "ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU",
            secretKey: "bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca"
        };

        let network = {
            url: 'http://localhost:3001',
            internalUrl: 'http://localhost:3001',
            networkId: "ae_devnet",
            compilerUrl: 'http://localhost:3080'
        }

        const UniversalFate = Universal.compose({
            props: {
                compilerOptions: {
                    backend: 'fate'
                },
                vmVersion: 5,
                abiVersion: 3
            }
        })

        let node = await Node({
            url: network.url,
            internalUrl: network.internalUrl,
            forceCompatibility: true
        })

        let client = await UniversalFate({
            nodes: [{
                name: 'token_migration',
                instance: node
            }],
            accounts: [AeSDK.MemoryAccount({
                keypair: keyPair
            })],
            nativeMode: true, // 
            networkId: network.networkId,
            compilerUrl: network.compilerUrl,
            forceCompatibility: true,
        })

        instance = await client.getContractInstance(contractSource, {
            backend: 'fate',
            vmVersion: 5,
            abiVersion: 3
        });

    })

    it('Deploying Example Contract', async () => {
        

        let a = await instance.deploy(['test', 5]);
        console.log(a)
    })

})