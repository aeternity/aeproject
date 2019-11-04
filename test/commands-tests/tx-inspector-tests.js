const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
chai.use(chaiFiles);

const fs = require('fs-extra');
const execute = require('../../packages/aeproject-utils/utils/aeproject-utils.js').aeprojectExecute;

const constants = require('../constants.json');
const testFolder = constants.txInspectorTestFolder;
const cliCmdOptions = constants.cliCommandsOptions;
const INSPECT = constants.cliCommands.INSPECT;

let executeOptions = {
    cwd: process.cwd() + testFolder
};

const spendTx = 'tx_+E0MAaEBK4bq9XiZ/0QVdOa8Hs9V18v6dGZYIa8XXNYFpQh6yq6hAR8To7CL8AFABmKmi2nYdfeAPOxMCGR/btXYTHiXvVCjCoJOIAABgL6cZFo=';
const validContractCreateTx = 'tx_+PoLAfhCuEAB3cmbG8P/MG3lxFYRcSAqneX66tGWLpbP1U+7V4Q6+ZsGGcJRikW/nBfk3HlbiQ4mVIuiJqHtlcAe/GhTpyEMuLL4sCoBoQHpu/YE5hG1Rgo7OZnpdxtvYEF9c858VRnhL34SehIlygu4aPhmRgOgC9n+d1XXo09rOw+lF4cYysPjtu1w2JxHzo11ummbU9TAuDme/kTWRB8ANwA3ABoOgj8BAz/+uBd+7AA3AQcHAQEAli8CEUTWRB8RaW5pdBG4F37sEW1haW6CLwCFNC4wLjAAgwUAA4ZHcyzkwACCGvYAAIMYF/iEO5rKAIcrEUTWRB8/oWDV4g==';
const invalidContractCreateTx = 'tx_+PoLAfhCuECRdwTeaI2onxi0YH/64dl8qdlLzxddWJTdmgLmejN/kqsuv0YDRz5MwOCLQSHbqDI2pyqNtLIzQjO7XvZG5NoLuLL4sCoBoQEqoOAY8jBHCYKJ+xLgPYzkjc9RvfL56vnz/NLMSAC/BgG4aPhmRgOgC9n+d1XXo09rOw+lF4cYysPjtu1w2JxHzo11ummbU9TAuDme/kTWRB8ANwA3ABoOgj8BAz/+uBd+7AA3AQcHAQEAli8CEUTWRB8RaW5pdBG4F37sEW1haW6CLwCFNC4wLjAAgwUAA4ZHcyzkwACCKLEAAIMYF/iEO5rKAIcrEUTWRB8/0P+Jmw==';
const contractCallTx = 'tx_+QFpCwH4QrhADdLEBzB9yxB+owNtaD4IsrNbV2FhLRSc3PDwfYlnZEafkbhUDHSMC17v7pNqPAHxmY6td3XzR3M+JRMN9/eBBbkBIPkBHSsBoQHpu/YE5hG1Rgo7OZnpdxtvYEF9c858VRnhL34SehIlyhihBZ1Jcpl4ENMAGowV2kXcHPlcrJFui6aAG2icGOwjAyV3AYcBnoLk5yAAAACDGBf4hDuaygC4wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgzCMc7daFfOIBnzwtkVVGQYINX6CnB9GXpGeGBrsUdgoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZUYXNrIEEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJ28j38=';

/*

--- should we create tx and test it ?!

*/

describe('Transaction inspector tests', async function () {
    before(async function () {
        fs.ensureDirSync(`.${ testFolder }`)

        await execute(constants.cliCommands.INIT, [], executeOptions)
        await execute(constants.cliCommands.NODE, [], executeOptions)
    })

    describe('Local network', async function () {
        it('Should successfully execute aeproject on local network', async function () {
            assert.isFulfilled(execute(INSPECT, [
                cliCmdOptions.TX,
                spendTx
            ]), 'Unable to execute inspect on local network.');
        })

        it('Should inspect spend tx correct in local network', async function () {
            let result = await execute(INSPECT, [
                cliCmdOptions.TX,
                spendTx
            ]);

            let expectedResultAsText = ` 'Nonce' - Account not found
            'fee' - The fee for the transaction is too low, the minimum fee for this transaction is 16660000000000
            'fee' - The account balance 0 is not enough to execute the transaction
            'amount' - The account balance 0 is not enough to execute the transaction
           { tx:
              { tag: '12',
                VSN: '1',
                senderId: 'ak_LAqgfAAjAbpt4hhyrAfHyVg9xfVQWsk1kaHaii6fYXt6AJAGe',
                recipientId: 'ak_Egp9yVdpxmvAfQ7vsXGvpnyfNq71msbdUpkMNYGTeTe8kPL3v',
                amount: '10',
                fee: '20000',
                ttl: '0',
                nonce: '1',
                payload: 'ba_Xfbg4g==' },
             txType: 'spendTx' }`

            let expectedResArr = expectedResultAsText.trim().split('\n').map(x => x.trim());

            expectedResArr.map(x => {
                if (!result.includes(x)) {
                    assert.isOk(false, 'Non expected data')
                }
            });
        })

        it('Should inspect valid contract create tx in local network', async function () {
            let result = await execute(INSPECT, [
                cliCmdOptions.TX,
                validContractCreateTx
            ]);

            let expectedResultAsText = `{ tx:
                { tag: '42',
                  VSN: '1',
                  ownerId: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
                  nonce: '11',
                  code:
                   'cb_+GZGA6AL2f53VdejT2s7D6UXhxjKw+O27XDYnEfOjXW6aZtT1MC4OZ7+RNZEHwA3ADcAGg6CPwEDP/64F37sADcBBwcBAQCWLwIRRNZEHxFpbml0EbgXfuwRbWFpboIvAIU0LjAuMACM5DZ8',
                  ctVersion: { vmVersion: '5', abiVersion: '3' },
                  fee: '78560000000000',
                  ttl: '6902',
                  deposit: '0',
                  amount: '0',
                  gas: '1579000',
                  gasPrice: '1000000000',
                  callData: 'cb_KxFE1kQfP4oEp9E=' },
               signatures:
                [ { raw:
                     <Buffer 01 dd c9 9b 1b c3 ff 30 6d e5 c4 56 11 71 20 2a 9d e5 fa ea d1 96 2e 96 cf d5 4f bb 57 84 3a f9 9b 06 19 c2 51 8a 45 bf 9c 17 e4 dc 79 5b 89 0e 26 54 ... 14 more bytes>,
                    hash:
                     'sg_FAQ2PoJsqHpv9ZDPiT4yozTNkuQ3YMAiK2e4c1yMuBi3DDsnKFLeBmrAzndeY6iGHesKwLHWaZ3AL54859mYg58RLorZ' } ],
               txType: 'contractCreateTx' }`

            let expectedResArr = expectedResultAsText.trim().split('\n').map(x => x.trim())
            expectedResArr.map(x => {
                if (!result.includes(x)) {
                    assert.isOk(false, 'Non expected data')
                }
            });
        })

        it('Should inspect invalid contract create tx in local network', async function () {
            let result = await execute(INSPECT, [
                cliCmdOptions.TX,
                invalidContractCreateTx
            ]);

            let expectedResultAsText = `'Nonce' - Account not found
            'fee' - The account balance 0 is not enough to execute the transaction
            'amount' - The account balance 0 is not enough to execute the transaction
           { tx:
              { tag: '42',
                VSN: '1',
                ownerId: 'ak_KmtNhieyxm1zDARjSsGzvv3n8qGGjsRNUcmsZv8CfTozrsjBY',
                nonce: '1',
                code:
                 'cb_+GZGA6AL2f53VdejT2s7D6UXhxjKw+O27XDYnEfOjXW6aZtT1MC4OZ7+RNZEHwA3ADcAGg6CPwEDP/64F37sADcBBwcBAQCWLwIRRNZEHxFpbml0EbgXfuwRbWFpboIvAIU0LjAuMACM5DZ8',
                ctVersion: { vmVersion: '5', abiVersion: '3' },
                fee: '78560000000000',
                ttl: '10417',
                deposit: '0',
                amount: '0',
                gas: '1579000',
                gasPrice: '1000000000',
                callData: 'cb_KxFE1kQfP4oEp9E=' },
             signatures:
              [ { raw:
                   <Buffer 91 77 04 de 68 8d a8 9f 18 b4 60 7f fa e1 d9 7c a9 d9 4b cf 17 5d 58 94 dd 9a 02 e6 7a 33 7f 92 ab 2e bf 46 03 47 3e 4c c0 e0 8b 41 21 db a8 32 36 a7 ... 14 more bytes>,
                  hash:
                   'sg_L2o8HWfghDvanAe6wbyvMj7ttCe361fEyDTpqJXPw198z2twfM2Y97bRxFCBvhn75f2qPrnFBVr7pNxYbMYNtrCDwiQVu' } ],
             txType: 'contractCreateTx' }`

            let expectedResArr = expectedResultAsText.trim().split('\n').map(x => x.trim())
            expectedResArr.map(x => {
                if (!result.includes(x)) {
                    assert.isOk(false, 'Non expected data')
                }
            });
        })

        it('Should inspect contract call tx in local network', async function () {
            let result = await execute(INSPECT, [
                cliCmdOptions.TX,
                contractCallTx
            ]);

            let expectedResultAsText = `nonce used in tx is '24'
           { tx:
              { tag: '43',
                VSN: '1',
                callerId: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
                nonce: '24',
                contractId: 'ct_2CGgcDvUarBGf5KFDArvCkVh4Pnj3NgWCYB2LY6Aw8Km4WPhtc',
                abiVersion: '1',
                fee: '455760000000000',
                ttl: '0',
                amount: '0',
                gas: '1579000',
                gasPrice: '1000000000',
                callData:
                 'cb_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACDMIxzt1oV84gGfPC2RVUZBgg1foKcH0ZekZ4YGuxR2CgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABlRhc2sgQQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAt7T8cw==' },
             signatures:
              [ { raw:
                   <Buffer 0d d2 c4 07 30 7d cb 10 7e a3 03 6d 68 3e 08 b2 b3 5b 57 61 61 2d 14 9c dc f0 f0 7d 89 67 64 46 9f 91 b8 54 0c 74 8c 0b 5e ef ee 93 6a 3c 01 f1 99 8e ... 14 more bytes>,
                  hash:
                   'sg_2otjUpLPHo2h4F52SCafiWmry7h9VeHsTSFYMPA7bfJ5Y9CFrPtGeMhASBHKcvM6fXM2yL95KjNyc7pL5iqwetsnMAm5J' } ],
             txType: 'contractCallTx' }`

            let expectedResArr = expectedResultAsText.trim().split('\n').map(x => x.trim())
            expectedResArr.map(x => {
                if (!result.includes(x)) {
                    assert.isOk(false, 'Non expected data')
                }
            });
        })
    })

    describe('Testnet network', async function () {

        let network = 'testnet';

        it('Should successfully execute aeproject on testnet network', async function () {
            assert.isFulfilled(execute(INSPECT, [
                cliCmdOptions.TX,
                spendTx,
                cliCmdOptions.NETWORK,
                network
            ]), 'Unable to execute inspect on testnet network.');
        })

        it('Should inspect spend tx correct in testnet network', async function () {
            let result = await execute(INSPECT, [
                cliCmdOptions.TX,
                spendTx,
                cliCmdOptions.NETWORK,
                network
            ]);

            let expectedResultAsText = `nonce used in tx is '1'.
            'fee' - The fee for the transaction is too low, the minimum fee for this transaction is 16660000000000
           { tx:
              { tag: '12',
                VSN: '1',
                senderId: 'ak_LAqgfAAjAbpt4hhyrAfHyVg9xfVQWsk1kaHaii6fYXt6AJAGe',
                recipientId: 'ak_Egp9yVdpxmvAfQ7vsXGvpnyfNq71msbdUpkMNYGTeTe8kPL3v',
                amount: '10',
                fee: '20000',
                ttl: '0',
                nonce: '1',
                payload: 'ba_Xfbg4g==' },
             txType: 'spendTx' }`

            let expectedResArr = expectedResultAsText.trim().split('\n').map(x => x.trim())
            expectedResArr.map(x => {
                if (!result.includes(x)) {
                    assert.isOk(false, 'Non expected data')
                }
            });
        })

        it('Should inspect valid contract create tx in testnet network', async function () {
            let result = await execute(INSPECT, [
                cliCmdOptions.TX,
                validContractCreateTx,
                cliCmdOptions.NETWORK,
                network
            ]);

            let expectedResultAsText = `nonce used in tx is '11'.
            'ttl' - The TTL is already expired,
            'nonce' - The nonce is invalid(already used). 
            'signature' - The signature cannot be verified, please verify that you used the correct network id and the correct private key for the sender address
           { tx:
              { tag: '42',
                VSN: '1',
                ownerId: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
                nonce: '11',
                code:
                 'cb_+GZGA6AL2f53VdejT2s7D6UXhxjKw+O27XDYnEfOjXW6aZtT1MC4OZ7+RNZEHwA3ADcAGg6CPwEDP/64F37sADcBBwcBAQCWLwIRRNZEHxFpbml0EbgXfuwRbWFpboIvAIU0LjAuMACM5DZ8',
                ctVersion: { vmVersion: '5', abiVersion: '3' },
                fee: '78560000000000',
                ttl: '6902',
                deposit: '0',
                amount: '0',
                gas: '1579000',
                gasPrice: '1000000000',
                callData: 'cb_KxFE1kQfP4oEp9E=' },
             signatures:
              [ { raw:
                   <Buffer 01 dd c9 9b 1b c3 ff 30 6d e5 c4 56 11 71 20 2a 9d e5 fa ea d1 96 2e 96 cf d5 4f bb 57 84 3a f9 9b 06 19 c2 51 8a 45 bf 9c 17 e4 dc 79 5b 89 0e 26 54 ... 14 more bytes>,
                  hash:
                   'sg_FAQ2PoJsqHpv9ZDPiT4yozTNkuQ3YMAiK2e4c1yMuBi3DDsnKFLeBmrAzndeY6iGHesKwLHWaZ3AL54859mYg58RLorZ' } ],
             txType: 'contractCreateTx' }`

            let expectedResArr = expectedResultAsText.trim().split('\n').map(x => x.trim())
            expectedResArr.map(x => {
                if (!result.includes(x)) {
                    assert.isOk(false, 'Non expected data')
                }
            });
        })

        it('Should inspect invalid contract create tx in testnet network', async function () {
            let result = await execute(INSPECT, [
                cliCmdOptions.TX,
                invalidContractCreateTx,
                cliCmdOptions.NETWORK,
                network
            ]);

            let expectedResultAsText = `'Nonce' - Account not found
            'ttl' - The TTL is already expired
            'fee' - The account balance 0 is not enough to execute the transaction
            'amount' - The account balance 0 is not enough to execute the transaction
            'signature' - The signature cannot be verified, please verify that you used the correct network id and the correct private key for the sender address
           { tx:
              { tag: '42',
                VSN: '1',
                ownerId: 'ak_KmtNhieyxm1zDARjSsGzvv3n8qGGjsRNUcmsZv8CfTozrsjBY',
                nonce: '1',
                code:
                 'cb_+GZGA6AL2f53VdejT2s7D6UXhxjKw+O27XDYnEfOjXW6aZtT1MC4OZ7+RNZEHwA3ADcAGg6CPwEDP/64F37sADcBBwcBAQCWLwIRRNZEHxFpbml0EbgXfuwRbWFpboIvAIU0LjAuMACM5DZ8',
                ctVersion: { vmVersion: '5', abiVersion: '3' },
                fee: '78560000000000',
                ttl: '10417',
                deposit: '0',
                amount: '0',
                gas: '1579000',
                gasPrice: '1000000000',
                callData: 'cb_KxFE1kQfP4oEp9E=' },
             signatures:
              [ { raw:
                   <Buffer 91 77 04 de 68 8d a8 9f 18 b4 60 7f fa e1 d9 7c a9 d9 4b cf 17 5d 58 94 dd 9a 02 e6 7a 33 7f 92 ab 2e bf 46 03 47 3e 4c c0 e0 8b 41 21 db a8 32 36 a7 ... 14 more bytes>,
                  hash:
                   'sg_L2o8HWfghDvanAe6wbyvMj7ttCe361fEyDTpqJXPw198z2twfM2Y97bRxFCBvhn75f2qPrnFBVr7pNxYbMYNtrCDwiQVu' } ],
             txType: 'contractCreateTx' }`

            let expectedResArr = expectedResultAsText.trim().split('\n').map(x => x.trim())
            expectedResArr.map(x => {
                if (!result.includes(x)) {
                    assert.isOk(false, 'Non expected data')
                }
            });
        })

        it('Should inspect contract call tx in testnet network', async function () {
            let result = await execute(INSPECT, [
                cliCmdOptions.TX,
                contractCallTx,
                cliCmdOptions.NETWORK,
                network
            ]);

            let expectedResultAsText = `nonce used in tx is '24'.
            'nonce' - The nonce is invalid(already used).
            'signature' - The signature cannot be verified, please verify that you used the correct network id and the correct private key for the sender address
           { tx:
              { tag: '43',
                VSN: '1',
                callerId: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
                nonce: '24',
                contractId: 'ct_2CGgcDvUarBGf5KFDArvCkVh4Pnj3NgWCYB2LY6Aw8Km4WPhtc',
                abiVersion: '1',
                fee: '455760000000000',
                ttl: '0',
                amount: '0',
                gas: '1579000',
                gasPrice: '1000000000',
                callData:
                 'cb_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACDMIxzt1oV84gGfPC2RVUZBgg1foKcH0ZekZ4YGuxR2CgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABlRhc2sgQQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAt7T8cw==' },
             signatures:
              [ { raw:
                   <Buffer 0d d2 c4 07 30 7d cb 10 7e a3 03 6d 68 3e 08 b2 b3 5b 57 61 61 2d 14 9c dc f0 f0 7d 89 67 64 46 9f 91 b8 54 0c 74 8c 0b 5e ef ee 93 6a 3c 01 f1 99 8e ... 14 more bytes>,
                  hash:
                   'sg_2otjUpLPHo2h4F52SCafiWmry7h9VeHsTSFYMPA7bfJ5Y9CFrPtGeMhASBHKcvM6fXM2yL95KjNyc7pL5iqwetsnMAm5J' } ],
             txType: 'contractCallTx' }`

            let expectedResArr = expectedResultAsText.trim().split('\n').map(x => x.trim())
            expectedResArr.map(x => {
                if (!result.includes(x)) {
                    assert.isOk(false, 'Non expected data')
                }
            });
        })

    })

    describe('Mainnet network', async function () {

        let network = 'mainnet';

        it('Should successfully execute aeproject on mainnet network', async function () {
            assert.isFulfilled(execute(INSPECT, [
                cliCmdOptions.TX,
                spendTx,
                cliCmdOptions.NETWORK,
                network
            ]), 'Unable to execute inspect on mainnet network.');
        })

        it('Should inspect spend tx correct in mainnet network', async function () {
            let result = await execute(INSPECT, [
                cliCmdOptions.TX,
                spendTx,
                cliCmdOptions.NETWORK,
                network
            ]);

            let expectedResultAsText = `nonce used in tx is '1'.
            'fee' - The fee for the transaction is too low, the minimum fee for this transaction is 16660000000000
           { tx:
              { tag: '12',
                VSN: '1',
                senderId: 'ak_LAqgfAAjAbpt4hhyrAfHyVg9xfVQWsk1kaHaii6fYXt6AJAGe',
                recipientId: 'ak_Egp9yVdpxmvAfQ7vsXGvpnyfNq71msbdUpkMNYGTeTe8kPL3v',
                amount: '10',
                fee: '20000',
                ttl: '0',
                nonce: '1',
                payload: 'ba_Xfbg4g==' },
             txType: 'spendTx' }`

            let expectedResArr = expectedResultAsText.trim().split('\n').map(x => x.trim())
            expectedResArr.map(x => {
                if (!result.includes(x)) {
                    assert.isOk(false, 'Non expected data')
                }
            });
        })

        it('Should inspect valid contract create tx in mainnet network', async function () {
            let result = await execute(INSPECT, [
                cliCmdOptions.TX,
                validContractCreateTx,
                cliCmdOptions.NETWORK,
                network
            ]);

            let expectedResultAsText = `'Nonce' - Account not found
            'ttl' - The TTL is already expired,
            'fee' - The account balance 0 is not enough to execute the transaction
            'amount' - The account balance 0 is not enough to execute the transaction
            'nonce' - The nonce is technically valid but will not be processed immediately by the node
            'signature' - The signature cannot be verified, please verify that you used the correct network id and the correct private key for the sender address
           { tx:
              { tag: '42',
                VSN: '1',
                ownerId: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
                nonce: '11',
                code:
                 'cb_+GZGA6AL2f53VdejT2s7D6UXhxjKw+O27XDYnEfOjXW6aZtT1MC4OZ7+RNZEHwA3ADcAGg6CPwEDP/64F37sADcBBwcBAQCWLwIRRNZEHxFpbml0EbgXfuwRbWFpboIvAIU0LjAuMACM5DZ8',
                ctVersion: { vmVersion: '5', abiVersion: '3' },
                fee: '78560000000000',
                ttl: '6902',
                deposit: '0',
                amount: '0',
                gas: '1579000',
                gasPrice: '1000000000',
                callData: 'cb_KxFE1kQfP4oEp9E=' },
             signatures:
              [ { raw:
                   <Buffer 01 dd c9 9b 1b c3 ff 30 6d e5 c4 56 11 71 20 2a 9d e5 fa ea d1 96 2e 96 cf d5 4f bb 57 84 3a f9 9b 06 19 c2 51 8a 45 bf 9c 17 e4 dc 79 5b 89 0e 26 54 ... 14 more bytes>,
                  hash:
                   'sg_FAQ2PoJsqHpv9ZDPiT4yozTNkuQ3YMAiK2e4c1yMuBi3DDsnKFLeBmrAzndeY6iGHesKwLHWaZ3AL54859mYg58RLorZ' } ],
             txType: 'contractCreateTx' }`

            let expectedResArr = expectedResultAsText.trim().split('\n').map(x => x.trim())
            expectedResArr.map(x => {
                if (!result.includes(x)) {
                    assert.isOk(false, 'Non expected data')
                }
            });
        })

        it('Should inspect invalid contract create tx in testnet network', async function () {
            let result = await execute(INSPECT, [
                cliCmdOptions.TX,
                invalidContractCreateTx,
                cliCmdOptions.NETWORK,
                network
            ]);

            let expectedResultAsText = `'Nonce' - Account not found
            'ttl' - The TTL is already expired,
            'fee' - The account balance 0 is not enough to execute the transaction
            'amount' - The account balance 0 is not enough to execute the transaction
            'signature' - The signature cannot be verified, please verify that you used the correct network id and the correct private key for the sender address
           { tx:
              { tag: '42',
                VSN: '1',
                ownerId: 'ak_KmtNhieyxm1zDARjSsGzvv3n8qGGjsRNUcmsZv8CfTozrsjBY',
                nonce: '1',
                code:
                 'cb_+GZGA6AL2f53VdejT2s7D6UXhxjKw+O27XDYnEfOjXW6aZtT1MC4OZ7+RNZEHwA3ADcAGg6CPwEDP/64F37sADcBBwcBAQCWLwIRRNZEHxFpbml0EbgXfuwRbWFpboIvAIU0LjAuMACM5DZ8',
                ctVersion: { vmVersion: '5', abiVersion: '3' },
                fee: '78560000000000',
                ttl: '10417',
                deposit: '0',
                amount: '0',
                gas: '1579000',
                gasPrice: '1000000000',
                callData: 'cb_KxFE1kQfP4oEp9E=' },
             signatures:
              [ { raw:
                   <Buffer 91 77 04 de 68 8d a8 9f 18 b4 60 7f fa e1 d9 7c a9 d9 4b cf 17 5d 58 94 dd 9a 02 e6 7a 33 7f 92 ab 2e bf 46 03 47 3e 4c c0 e0 8b 41 21 db a8 32 36 a7 ... 14 more bytes>,
                  hash:
                   'sg_L2o8HWfghDvanAe6wbyvMj7ttCe361fEyDTpqJXPw198z2twfM2Y97bRxFCBvhn75f2qPrnFBVr7pNxYbMYNtrCDwiQVu' } ],
             txType: 'contractCreateTx' }`

            let expectedResArr = expectedResultAsText.trim().split('\n').map(x => x.trim())
            expectedResArr.map(x => {
                if (!result.includes(x)) {
                    assert.isOk(false, 'Non expected data')
                }
            });
        })

        it('Should inspect contract call tx in testnet network', async function () {
            let result = await execute(INSPECT, [
                cliCmdOptions.TX,
                contractCallTx,
                cliCmdOptions.NETWORK,
                network
            ]);

            let expectedResultAsText = `'Nonce' - Account not found
            'fee' - The account balance 0 is not enough to execute the transaction
            'amount' - The account balance 0 is not enough to execute the transaction
            'nonce' - The nonce is technically valid but will not be processed immediately by the node (next valid nonce is
            'signature' - The signature cannot be verified, please verify that you used the correct network id and the correct private key for the sender address
           { tx:
              { tag: '43',
                VSN: '1',
                callerId: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
                nonce: '24',
                contractId: 'ct_2CGgcDvUarBGf5KFDArvCkVh4Pnj3NgWCYB2LY6Aw8Km4WPhtc',
                abiVersion: '1',
                fee: '455760000000000',
                ttl: '0',
                amount: '0',
                gas: '1579000',
                gasPrice: '1000000000',
                callData:
                 'cb_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACDMIxzt1oV84gGfPC2RVUZBgg1foKcH0ZekZ4YGuxR2CgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABlRhc2sgQQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAt7T8cw==' },
             signatures:
              [ { raw:
                   <Buffer 0d d2 c4 07 30 7d cb 10 7e a3 03 6d 68 3e 08 b2 b3 5b 57 61 61 2d 14 9c dc f0 f0 7d 89 67 64 46 9f 91 b8 54 0c 74 8c 0b 5e ef ee 93 6a 3c 01 f1 99 8e ... 14 more bytes>,
                  hash:
                   'sg_2otjUpLPHo2h4F52SCafiWmry7h9VeHsTSFYMPA7bfJ5Y9CFrPtGeMhASBHKcvM6fXM2yL95KjNyc7pL5iqwetsnMAm5J' } ],
             txType: 'contractCallTx' }`

            let expectedResArr = expectedResultAsText.trim().split('\n').map(x => x.trim())
            expectedResArr.map(x => {
                if (!result.includes(x)) {
                    assert.isOk(false, 'Non expected data')
                }
            });
        })
    })

    describe('Invalid network', async function () {
        it('Should NOT be able to inspect tx in invalid network', async function () {
            let result = await execute(INSPECT, [
                cliCmdOptions.TX,
                contractCallTx,
                cliCmdOptions.NETWORK,
                'localhost:4003',
                cliCmdOptions.NETWORK_ID,
                'ae_invalid'
            ]);

            assert.isOk(result.includes('Error: connect'), 'There is connection to invalid ae node')
        })
    })

    after(async function () {
        await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)

        fs.removeSync(`.${ testFolder }`)
    })
})