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
    printError,
    print,
} = require('../../aeproject-utils');
const utils = require('../../aeproject-utils');
const config = require('../../aeproject-config');
const { ContractCompilerAPI } = require('@aeternity/aepp-sdk');

async function compileAndPrint (file, compiler) {
    try {
        const result = await compiler.compileContractAPI(utils.getContractContent(file), {filesystem: utils.getFilesystem(file)});
        print(`Contract '${file}' has been successfully compiled.`);
        print(`=> bytecode: ${result}`);
    } catch (error) {
        const errorMessage = utils.checkNestedProperty(error.response, 'data') ? JSON.parse(error.response.data)[0] : error.message;
        printError(`Contract '${file}' has not been compiled.`);
        printError(`=> reason: ${JSON.stringify(errorMessage)}`);
    }
}

async function run (path, compilerUrl = config.compilerUrl) {
    print('===== Compiling contracts =====');
    print('\r');
    const compiler = await ContractCompilerAPI({compilerUrl});
    print(`Compiler URL: ${compilerUrl}`);
    print(`Compiler version: ${await compiler.getCompilerVersion()}`);
    print('\r');
    print(`Contract path: ${path}`);
    if (path.includes('.aes')) {
        compileAndPrint(path, compiler)
    } else {
        print('\r');
        const files = await utils.getFiles(`${ process.cwd() }/${ path }/`, `.*\.(aes)`);
        files.forEach(async (file) => {
            compileAndPrint(file, compiler)
        });
    }
}

module.exports = {
    run
}