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

const axios = require('axios');
const utils = require('aeproject-utils');
const TxValidator = require('aeproject-utils').txValidator;

const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

async function run (option) {

    if (!option.tx) {
        throw Error('[--tx] Raw tx is required');
    }

    if (option.tx.trim().split('_')[0] !== 'tx' || !base64regex.test(option.tx.trim().slice(3))) {
        throw new Error('Invalid Transaction Hash');
    }
    
    const network = utils.getNetwork(option.network ? option.network : 'local', option.networkId);
    
    const validator = await TxValidator({
        url: network.url,
        internalUrl: network.url + '/internal',
        forceCompatibility: true
    });

    let result = await validator.unpackAndVerify(option.tx, network.networkId);

    let publicKey = getPublicKeyFromTx(result.txType, result.tx);
    
    await processNonceInfo(network, publicKey, result.tx.nonce)
    // await processNonceInfo(network, 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU', result.tx.nonce);

    printValidationResult(result);

    delete result.validation;
    console.log(result);
}

function getPublicKeyFromTx (txType, tx) {
    switch (txType) {
        case 'contractCallTx': return tx.callerId;

        // GA_ATTACH_TX - ownerId - gaAttach
        case 'gaAttach':
        case 'contractCreateTx': return tx.ownerId;

        // ORACLE_QUERY_TX - senderId
        case 'oracleQuery':
        case 'spendTx': return tx.senderId;

        // NAME_PRE_CLAIM_TX - accountId - namePreClaimTx
        // NAME_CLAIM_TX - accountId - nameClaimTx
        // NAME_CLAIM_TX_2 - accountId - nameClaimTx
        // NAME_UPDATE_TX - accountId - nameUpdateTx
        // NAME_TRANSFER_TX - accountId - nameTransfer
        // NAME_REVOKE_TX - accountId - nameRevokeTx
        // ORACLE_REGISTER_TX - accountId - oracleRegister
        case 'namePreClaimTx':
        case 'nameClaimTx':
        case 'nameUpdateTx':
        case 'nameTransfer':
        case 'nameRevokeTx':
        case 'oracleRegister': return tx.accountId;

        // CONTRACT_TX - contract -  owner 
        // CHANNEL_OFFCHAIN_CREATE_CONTRACT_TX - channelOffChainCreateContract - owner
        case 'contract':
        case 'channelOffChainCreateContract': return tx.owner


        // GA_META_TX - gaId - gaMeta
        case 'gaMeta': return tx.gaId;

        // ORACLE_EXTEND_TX - oracleId - oracleExtend
        case 'oracleExtend': return tx.oracleId;

        // CHANNEL_CREATE_TX - channelCreate - initiator 
        // CHANNEL_TX_2 -channel - initiator
        // CHANNEL_TX - channel = initiator
        case 'channelCreate':
        case 'channel': return tx.initiator;

        // CHANNEL_DEPOSIT_TX - channelDeposit - fromId
        // CHANNEL_CLOSE_MUTUAL_TX - channelCloseMutual - fromId
        // CHANNEL_CLOSE_SOLO_TX - - channelCloseSolo fromId
        // CHANNEL_SLASH_TX - channelSlash - fromId
        // CHANNEL_SETTLE_TX - channelSettle - fromId
        //  CHANNEL_SNAPSHOT_SOLO_TX - channelSnapshotSolo-  fromId
        case 'channelDeposit':
        case 'channelCloseMutual':
        case 'channelCloseSolo':
        case 'channelSlash':
        case 'channelSettle':
        case 'channelSnapshotSolo': return tx.fromId;

        // CHANNEL_WITHDRAW_TX - toId
        case 'channelWithdraw': return tx.toId;

        // CHANNEL_OFFCHAIN_UPDATE_TRANSFER_TX - channelOffChainUpdateTransfer - from
        // CHANNEL_OFFCHAIN_UPDATE_DEPOSIT_TX - channelOffChainUpdateDeposit - from
        // CHANNEL_OFFCHAIN_UPDATE_WITHDRAWAL_TX - - channelOffChainUpdateWithdrawal from
        case 'channelOffChainUpdateTransfer':
        case 'channelOffChainUpdateDeposit':
        case 'channelOffChainUpdateWithdrawal': return tx.from;

        // CHANNEL_OFFCHAIN_CALL_CONTRACT_TX - caller
        case 'channelOffChainCallContract': return tx.caller;
    }
}

async function processNonceInfo (network, publicKey, nonce) {

    if (!publicKey) {
        print('error', 'Nonce', 'Missing public key. Please provide raw tx to aeproject team to investigate the case.');
        return;
    }

    const url = `${ network.url }/v2/accounts/${ publicKey }`;
    
    try {
        let result = await axios.get(url);
        
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