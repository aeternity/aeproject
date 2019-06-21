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

const AeSDK = require('@aeternity/aepp-sdk');
const Crypto = AeSDK.Crypto;
const toBytes = require('@aeternity/aepp-sdk/es/utils/bytes').toBytes;

function keyToHex (publicKey) {
    let byteArray = Crypto.decodeBase58Check(publicKey.split('_')[1]);
    let asHex = '#' + byteArray.toString('hex');
    return asHex;
}

const isKeyPair = (k) => {
    if (k == null) {
        return false
    }
    if (typeof k != 'object') {
        return false
    }

    if (!k.hasOwnProperty('publicKey')) {
        return false
    }

    if (!k.hasOwnProperty('secretKey')) {
        return false
    }

    return true
};

const generatePublicKeyFromSecretKey = (secretKey) => {
    const hexStr = Crypto.hexStringToByte(secretKey.trim())
    const keys = Crypto.generateKeyPairFromSecret(hexStr)

    return Crypto.aeEncodeKey(keys.publicKey)
}

async function generateKeyPairFromSecretKey (secretKey) {
    const hexStr = await Crypto.hexStringToByte(secretKey.trim());
    const keys = await Crypto.generateKeyPairFromSecret(hexStr);

    const publicKey = await Crypto.aeEncodeKey(keys.publicKey);

    let keyPair = {
        publicKey,
        secretKey
    }

    return keyPair;
}

function decodedHexAddressToPublicAddress (hexAddress) {

    const publicKey = Crypto.aeEncodeKey(toBytes(hexAddress, true));

    return publicKey;
}

const trimAdresseses = (addressToTrim) => {
    return addressToTrim.substring(3)
}
module.exports = {
    keyToHex,
    isKeyPair,
    generatePublicKeyFromSecretKey,
    generateKeyPairFromSecretKey,
    decodedHexAddressToPublicAddress,
    trimAdresseses
};
