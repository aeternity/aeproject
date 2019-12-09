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
    print
} = require('aeproject-utils');

const nodeConfig = require('aeproject-config');
const compilerConfigs = nodeConfig.compilerConfiguration;

const DEFAULT_COMPILER_PORT = 3080;

const EnvService = require('../../EnvService')

class Compiler extends EnvService {

    constructor () {
        super('compiler')
    }

    async run (option) {

        let compilerImage = compilerConfigs.dockerServiceCompilerName;
        
        try {
            
            let running = await super.isImageRunning(compilerImage);
             
            if (option.info) {
                await super.printInfo(running)
                return
            }

            if (option.stop) {

                // if not running, current env may be windows
                // to reduce optional params we check is it running on windows env
                if (!running) {
                    running = await super.isImageRunning(compilerImage);
                }

                if (!running) {
                    printError('===== Compiler is not running! =====');
                    return
                }

                super.printInitialStopMsg()

                try {
                    await super.stopCompiler();
                } catch (error) {
                    printError(Buffer.from(error.stderr).toString('utf-8'))
                }

                return;
            }
           
            if (!await this.shouldProcessStart(running)) return

            super.printStarMsg()

            await super.start(compilerImage);

            super.printSuccessMsg()

        } catch (e) {
            printError(e.message || e);
        }
    }

    async shouldProcessStart (running) {
        
        if (!super.hasCompilerConfigFiles()) {
            print('Process will be terminated!');
            return false
        }

        if (running) {
            print('\r\n===== Compiler already started and healthy! =====')
            return false
        }

        if (await super.checkForAllocatedPort(DEFAULT_COMPILER_PORT)) {
            print(`\r\n===== Port [${ DEFAULT_COMPILER_PORT }] is already allocated! Process will be terminated! =====`);
            print(`Cannot start AE compiler, port is already allocated!`);
            return false
        }
        
        return true
    }
}

const compiler = new Compiler()

module.exports = {
    run: async (options) => {
        await compiler.run(options)
    }
}