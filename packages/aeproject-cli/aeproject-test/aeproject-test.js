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
const {
  print
} = require('aeproject-utils');
const contractUtils = require('aeproject-utils');
const Mocha = require("mocha");
const originalRequire = require("original-require");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const nodeConfig = require('aeproject-config')

async function run (files) {
    try {
        print('===== Starting Tests =====');
        let mochaConfig = {
            useColors: true,
            timeout: 550000,
            exit: true
        };
        let mocha = await createMocha(mochaConfig, files);
        setGlobalOptions();

        for (let i = 0; i < files.length; i++) {
            delete originalRequire.cache[files[i]];
            mocha.addFile(files[i]);
        }

        await runMocha(mocha);

    } catch (e) {
        console.error(e);
    }
}

const createMocha = async (config, files) => {

    let mocha = new Mocha(config);

    files.forEach(file => {
        mocha.addFile(file);
    });

    return mocha;
}

const runMocha = (mocha) => {

    return new Promise((resolve, reject) => {
        mocha.run(failures => {

            if (failures) {
                reject(failures);
            } else {
                resolve();
            }
        });
    })
}

async function setGlobalOptions () {
    global.assert = chai.assert;
    global.utils = contractUtils;
    global.minerWallet = nodeConfig.config.keyPair;
    global.wallets = nodeConfig.defaultWallets;
}

module.exports = {
    run
}