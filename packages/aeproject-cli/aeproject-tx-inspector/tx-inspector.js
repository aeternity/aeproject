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

const TxValidator = require('aeproject-utils').txValidator;

async function run (option) {
    // let dockerImage = option.windows;

    const validator = await TxValidator({
        url: 'http://localhost:3001',
        internalUrl: 'http://localhost:3001/internal',
        forceCompatibility: true
    });

    let tx = 'tx_+PoLAfhCuECRdwTeaI2onxi0YH/64dl8qdlLzxddWJTdmgLmejN/kqsuv0YDRz5MwOCLQSHbqDI2pyqNtLIzQjO7XvZG5NoLuLL4sCoBoQEqoOAY8jBHCYKJ+xLgPYzkjc9RvfL56vnz/NLMSAC/BgG4aPhmRgOgC9n+d1XXo09rOw+lF4cYysPjtu1w2JxHzo11ummbU9TAuDme/kTWRB8ANwA3ABoOgj8BAz/+uBd+7AA3AQcHAQEAli8CEUTWRB8RaW5pdBG4F37sEW1haW6CLwCFNC4wLjAAgwUAA4ZHcyzkwACCKLEAAIMYF/iEO5rKAIcrEUTWRB8/0P+Jmw==';

    let result = await validator.unpackAndVerify(tx, 'ae_devnet');
    console.log(result);

    validationAndTx(result)
}

function print(type, txKey, msg) {
    console.log(`[${ type.toUpperCase() }] '${ txKey }' - ${ msg }`);
}

function validationAndTx (data) {
    if (data.validation) {
        data.validation.map(x => {
            print(x.type, x.txKey, x.msg)
        })
    }
    
    // get nonce // v2/accounts/{pubkey}
    // get block
    // ct version
    // ttl
    // 
}

function validationAndTx1 (data) {
    const signatureError = data.validation.find(v => v['txKey'] === 'signature');
    if (data.signatures && data.signatures[0]) {
        data.signature = {
            ...data.signatures[0],
            error: signatureError && signatureError.msg
        };
    }

    return {
        ...data,
        txObject: Object
            .entries(data.tx)
            .reduce(
                (acc, [key, value]) => {
                    const validation =
                        data.validation
                            .reduce(
                                (acc, {
                                    txKey,
                                    type,
                                    msg
                                }) => {
                                    if (key === txKey) acc[type] = msg;
                                    return acc;
                                }, {}
                            );
                    acc[key] = {
                        value,
                        ...validation,
                        title: key
                    };
                    return acc
                }, {}
            )
    };
}

module.exports = {
    run
}