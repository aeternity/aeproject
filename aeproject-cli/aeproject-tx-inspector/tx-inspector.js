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

const { TransactionValidator, Node } = require('@aeternity/aepp-sdk');
const utils = require('../../aeproject-utils');

const httpGet = utils.httpGet;

const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

async function run (option) {

    if (!option.tx) {
        throw Error('<tx> Raw transaction is required');
    }

    if (option.tx.trim().split('_')[0] !== 'tx' || !base64regex.test(option.tx.trim().slice(3))) {
        throw new Error('Invalid raw transaction');
    }

    const network = utils.getNetwork(option.network ? option.network : 'local', option.networkId);

    const validator = await TransactionValidator({
        nodes: [{ name: 'temp', instance: await Node({ url: network.url }) }],
        forceCompatibility: true
    });

    let result = await validator.unpackAndVerify(option.tx, { networkId: network.networkId });

    let publicKey = getPublicKeyFromTx(result.txType, result.tx);

    await processNonceInfo(network, publicKey, result.tx.nonce);

    printValidationResult(result);

    delete result.validation;

    console.log(result);
}

function getPublicKeyFromTx (txType, tx) {
    switch (txType) {
        case 'contractCallTx':
            return tx.callerId;

        case 'gaAttach':
        case 'contractCreateTx':
            return tx.ownerId;

        case 'oracleQuery':
        case 'spendTx':
            return tx.senderId;

        case 'namePreClaimTx':
        case 'nameClaimTx':
        case 'nameUpdateTx':
        case 'nameTransfer':
        case 'nameRevokeTx':
        case 'oracleRegister':
            return tx.accountId;

        case 'contract':
        case 'channelOffChainCreateContract':
            return tx.owner

        case 'gaMeta':
            return tx.gaId;

        case 'oracleExtend':
            return tx.oracleId;

        case 'channelCreate':
        case 'channel':
            return tx.initiator;

        case 'channelDeposit':
        case 'channelCloseMutual':
        case 'channelCloseSolo':
        case 'channelSlash':
        case 'channelSettle':
        case 'channelSnapshotSolo':
            return tx.fromId;

        case 'channelWithdraw':
            return tx.toId;

        case 'channelOffChainUpdateTransfer':
        case 'channelOffChainUpdateDeposit':
        case 'channelOffChainUpdateWithdrawal':
            return tx.from;

        case 'channelOffChainCallContract':
            return tx.caller;
        default:
            print('error', 'Nonce', 'Public key cannot be extracted, please send raw tx to aeproject team.');
            return '';
    }
}

async function processNonceInfo (network, publicKey, nonce) {

    if (!publicKey) {
        return;
    }

    const url = `${ network.url }/v2/accounts/${ publicKey }`;

    try {
        let result = await httpGet(url);

        if (result.data) {
            const msg = `Current account nonce is '${ parseInt(result.data.nonce) }', nonce used in tx is '${ parseInt(nonce) }'.`;
            print(parseInt(nonce) > parseInt(result.data.nonce) ? 'error' : 'info', 'Nonce', msg);
        }

    } catch (error) {

        if (error.response.status === 404 && error.response.data && error.response.data.reason) {
            print('warning', 'Nonce', `${ error.response.data.reason }`);
        } else {
            throw Error(error);
        }
    }
}

function print (type, txKey, msg) {
    switch (type.toLowerCase()) {
        case 'error':
            console.log("\x1b[31m", `[${ type.toUpperCase() }] \x1b[0m '${ txKey }' - ${ msg }`);
            break;
        case 'warning':
            console.log("\x1b[33m", `[${ type.toUpperCase() }] \x1b[0m '${ txKey }' - ${ msg }`);
            break;
        default:
            console.log(` [${ type.toUpperCase() }] '${ txKey }' - ${ msg }`);
    }
}

function printValidationResult (data) {
    if (data.validation) {
        data.validation.map(x => {
            print(x.type, x.txKey, x.msg)
        })
    }
}

module.exports = {
    run
}
