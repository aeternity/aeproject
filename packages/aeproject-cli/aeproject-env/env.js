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
    print,
    printError,
    getInfo,
    waitForContainer,
    readSpawnOutput
} = require('aeproject-utils')

const node = require('./node/node')
const compiler = require('./compiler/compiler')

const nodeConfig = require('aeproject-config')
const nodeConfiguration = nodeConfig.nodeConfiguration;
const compilerConfiguration = nodeConfig.compilerConfiguration;

async function printInfo (running, unit) {

    if (!running) {
        printError(`===== Compiler or Node is not running! ===== \n===== Please run the relevant command for your image! =====`)
        return
    }

    let buff = await getInfo(unit);
    let res = readSpawnOutput(buff)

    print(res);
}

async function areNodeAndCompilerRunning (...images) {
    let running = true
    
    for (const currImage in images) {
        running = await waitForContainer(images[currImage]) && running
    }

    return running    
}

async function run (option) {

    if (option.info) {
        let dockerImage = option.windows ? nodeConfiguration.dockerImage : nodeConfiguration.dockerServiceNodeName;
        let compilerImage = option.windows ? compilerConfiguration.dockerImage : compilerConfiguration.dockerServiceCompilerName;
        let running = await areNodeAndCompilerRunning(dockerImage, compilerImage)

        await printInfo(running)
        
        return
    }

    await compiler.run(option)
    await node.run(option)
}

module.exports = {
    run
}