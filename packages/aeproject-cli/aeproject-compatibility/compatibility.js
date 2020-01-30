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
    readFile
} = require('aeproject-utils');

const {
    exec,
    spawn
} = require('promisify-child-process');

const nodeConfig = require('aeproject-config').nodeConfiguration;

async function run (option) {

    let nodeVersion = option.nodeVersion;
    let compilerVersion = option.compilerVersion;

    if (nodeVersion && compilerVersion) {
        print(`===== Testing current project with latest node ${ nodeVersion } and compiler ${ compilerVersion } version =====`);
    } else if (nodeVersion && !compilerVersion) {
        print(`===== Testing current project with node ${ nodeVersion } and latest compiler version =====`);
        compilerVersion = 'latest';
    } else if (!nodeVersion && compilerVersion) {
        print(`===== Testing current project with compiler ${ compilerVersion } and latest node version =====`);
        nodeVersion = 'latest';
    } else {
        print('===== Testing current project with latest node and compiler version =====');
        compilerVersion = 'latest';
        nodeVersion = 'latest';
    }

    let cmdToExecute = `aeproject env --nodeVersion ${ nodeVersion } --compilerVersion ${ compilerVersion }`;
    if (option.windows) {
        cmdToExecute += ` --windows --docker-ip ${ option.dockerIp ? option.dockerIp : nodeConfig.dockerMachineIP }`;
    }

    console.log('Starting environment...');
    await exec(cmdToExecute);
    
    try {
        console.log('Running tests...');
        
        let testResult = await exec(`aeproject test`);
        printChildProcessResult(testResult);
    } catch (error) {
        console.log(error.stdout);
        console.log(error.stderr);
    }
    
    let stopResult = await exec(`aeproject env --stop`);
    printChildProcessResult(stopResult);
}

const printChildProcessResult = childProcess => {
    console.log(childProcess.stdout);
    console.log(childProcess.stderr);
}

module.exports = {
    run
}