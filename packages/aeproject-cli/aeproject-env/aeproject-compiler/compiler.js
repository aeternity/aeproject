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
    waitForContainer,
    start,
    stopCompiler,
    checkForAllocatedPort,
    printInfo,
    printSuccessMsg,
    printStarMsg,
    printInitialStopMsg,
    toggleLoader,
    capitalize
} = require('aeproject-utils');

const utils = require('aeproject-utils');

const fs = require('fs');
const path = require('path');

const nodeConfig = require('aeproject-config')
const localCompilerConfig = nodeConfig.compilerConfiguration;
const nodeConfiguration = nodeConfig.nodeConfiguration;

let network = utils.config.localhostParams
network.compilerUrl = utils.config.compilerUrl

const DEFAULT_COMPILER_PORT = 3080;
const unit = 'compiler'

function hasCompilerConfigFiles () {
    const neededCompilerConfigFile = localCompilerConfig.configFileName;
    const compilerConfigFilePath = path.resolve(process.cwd(), neededCompilerConfigFile);

    let doesCompilerConfigFileExists = fs.existsSync(compilerConfigFilePath);

    if (!doesCompilerConfigFileExists) {
        print(`Missing ${ neededCompilerConfigFile } file!`);
        return false;
    }

    let compilerFileContent = fs.readFileSync(compilerConfigFilePath, 'utf-8');

    if (compilerFileContent.indexOf(localCompilerConfig.textToSearch) < 0) {
        print(`Invalid  ${ neededCompilerConfigFile } file!`);
        return false;
    }

    return true;
}

async function run (option) {
    
    let compilerImage = option.windows ? nodeConfiguration.dockerImage : nodeConfiguration.dockerServiceCompilerName;

    try {
        let running = await waitForContainer(compilerImage);

        if (option.info) {
            await printInfo(running, capitalize(unit))
            return
        }

        if (option.stop) {

            // if not running, current env may be windows
            // to reduce optional params we check is it running on windows env
            if (!running) {
                running = await waitForContainer(compilerImage);
            }

            if (!running) {
                printError('===== Compiler is not running! =====');
                return
            }
            
            printInitialStopMsg(unit)

            try {
                await stopCompiler();
            } catch (error) {
                printError(Buffer.from(error.stderr).toString('utf-8'))
            }

            return;
        }

        if (!hasCompilerConfigFiles()) {
            print('Process will be terminated!');
            return;
        }

        if (running) {
            print('\r\n===== Compiler already started and healthy! =====')
            return;
        }

        // if (!option.onlyCompiler && await checkForAllocatedPort(DEFAULT_NODE_PORT)) {
        //     print(`\r\n===== Port [${ DEFAULT_NODE_PORT }] is already allocated! Process will be terminated! =====`);
        //     throw new Error(`Cannot start AE node, port is already allocated!`);
        // }

        if (await checkForAllocatedPort(DEFAULT_COMPILER_PORT)) {
            print(`\r\n===== Port [${ DEFAULT_COMPILER_PORT }] is already allocated! Process will be terminated! =====`);
            throw new Error(`Cannot start AE compiler, port is already allocated!`);
        }

        printStarMsg(unit)
        
        let startingCompilerSpawn = start(unit);

        await toggleLoader(startingCompilerSpawn, compilerImage)

        printSuccessMsg(unit)

    } catch (e) {
        printError(e.message || e);
    }
    
}

module.exports = {
    run
}