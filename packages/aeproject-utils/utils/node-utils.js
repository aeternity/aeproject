const path = require('path');
const fs = require('fs');
const { LogNodeService } = require('aeproject-logger');
let nodeService = new LogNodeService();
const {
    spawn
} = require('promisify-child-process');
const {
    print
} = require('./fs-utils');
const {
    readSpawnOutput, 
    readErrorSpawnOutput,
    capitalize
} = require('./aeproject-utils');

const nodeConfig = require('aeproject-config');
const compilerConfigs = nodeConfig.compilerConfiguration;
const nodeConfigs = nodeConfig.nodeConfiguration;

const MAX_SECONDS_TO_RUN_NODE = 90;
const { sleep } = require('./aeproject-utils');

async function start (unit) {

    if (unit === 'node') {
        spawn('docker-compose', ['-f', 'docker-compose.yml', 'up', '-d']);
        return nodeService.save(unit);
    } else if (unit === 'compiler') {
        spawn('docker-compose', ['-f', 'docker-compose.compiler.yml', 'up', '-d']);
        return nodeService.save(unit);
    } 

    spawn('docker-compose', ['-f', 'docker-compose.yml', '-f', 'docker-compose.compiler.yml', 'up', '-d']);
    return nodeService.save();
}

async function stopAll () {
    
    if (nodeService.getNodePath() && nodeService.getCompilerPath()) {
        await stopNode();
        await stopCompiler();
    } else if (nodeService.getNodePath()) {
        await stopNode();
    } else if (nodeService.getCompilerPath()) {
        await stopCompiler();
    }
}

async function stopNode () {
    try {
        await spawn('docker-compose', [
            '-f',
            `${ nodeService.getNodePath() }`,
            'down'
        ]);

        print('===== Node was successfully stopped! ====='); 

        return nodeService.delete('node');
    } catch (error) {
        if (readErrorSpawnOutput(error).indexOf('active endpoints')) {
            nodeService.delete('node');
            return print('===== Node was successfully stopped! =====');
        } 
        
        throw new Error(error);
    }
}

async function stopCompiler () {
    try {
        await spawn('docker-compose', [
            '-f',
            `${ nodeService.getCompilerPath() }`,
            'down'
        ]);

        print('===== Compiler was successfully stopped! =====');
        
        return nodeService.delete('compiler');
    } catch (error) {
        if (readErrorSpawnOutput(error).indexOf('active endpoints')) {
            nodeService.delete('compiler');
            return print('===== Compiler was successfully stopped! =====');
        }

        throw new Error(error);
    }
    
}

function stopSeparately (options) {
    return options.only ? stopNode() : stopCompiler();
}

async function getInfo (unit, options) {
    let nodePath = nodeService.getNodePath();
    let compilerPath = nodeService.getCompilerPath();

    if (!unit && nodePath && compilerPath) {        
        return spawn('docker-compose', [
            '-f',
            `${ nodePath }`,
            '-f',
            `${ compilerPath }`,
            'ps'
        ], options);
    } else if (unit.indexOf('node') >= 0 && nodePath) {
        return spawn('docker-compose', ['-f', `${ nodePath }`, 'ps'], options);
    } else if (unit.indexOf('compiler') >= 0 && compilerPath) {
        return spawn('docker-compose', ['-f', `${ compilerPath }`, 'ps'], options);
    } else {
        return spawn('docker-compose', [
            '-f',
            `${ 'docker-compose.yml' }`,
            '-f',
            `${ 'docker-compose.compiler.yml' }`,
            'ps'
        ], options);
    }
}

async function printInfo (running, unit) {
    
    if (!running) {
        print(`===== ${ capitalize(unit) } is not running! =====`);
        return
    }

    let buff = await getInfo(unit);
    let res = readSpawnOutput(buff);

    print(res);
}

async function waitForContainer (image, options) {
    
    try {
        let running = false;

        let result = await getInfo(image, options);
        let res = readSpawnOutput(result);

        if (res) {
            res = res.split('\n');
        }

        if (Array.isArray(res)) {
            res.map(line => {
                if (line.indexOf(image) >= 0 && line.includes('healthy')) {
                    running = true;
                }
            })
        }

        return running;
    } catch (error) {

        if (checkForMissingDirectory(error)) {
            return false;
        }

        if (error.stderr) {
            console.log(error.stderr.toString('utf8'));
        } else {
            console.log(error.message || error);
        }

        throw Error(error);
    }
}

async function toggleLoader (startingNodeSpawn, image) {

    if (startingNodeSpawn.stdout) {
        startingNodeSpawn.stdout.on('data', (data) => {
            print(data.toString());
        });
    }

    let errorMessage = '';
    if (startingNodeSpawn.stderr) {
        startingNodeSpawn.stderr.on('data', (data) => {
            errorMessage += data.toString();
            print(data.toString());
        });
    }

    let counter = 0;
    while (!(await waitForContainer(`${ image }`))) {
        if (errorMessage.indexOf('port is already allocated') >= 0 || errorMessage.indexOf(`address already in use`) >= 0) {
            await stopAll();
            throw new Error(`Cannot start AE node, port is already allocated!`);
        }

        process.stdout.write(".");
        sleep(1000);

        // prevent infinity loop
        counter++;
        if (counter >= MAX_SECONDS_TO_RUN_NODE) {
            // if node is started and error message is another,
            // we should stop docker

            await stopAll();
            throw new Error("Cannot start AE Node!");
        }
    }
} 

function checkForMissingDirectory (e) {
    return (e.stderr && e.stderr.toString('utf-8').indexOf('No such file or directory'));
}

async function checkForAllocatedPort (port) {
    try {
        let scanForAllocatedPort = await spawn('lsof', ['-i', `:${ port }`]);

        if (scanForAllocatedPort.stdout) {
            return scanForAllocatedPort.stdout.toString('utf8').length > 0
        }
    } catch (e) {
        // Throws an error when there is no running port. Exceptions are handled elsewhere.
        // console.log(e)
    }

    return false;
}

function printSuccessMsg (unit) {
    if (unit == 'node') return print('\n\r===== Node was successfully started! =====');
    if (unit == 'compiler') return print('\n\r===== Compiler was successfully started! =====');
   
    print('\n\r===== Node was successfully started! =====');
    print('===== Compiler was successfully started! =====');
    print('===== Funding default wallets! =====');
}

function printStarMsg (unit) {
    if (unit == 'node') return print('===== Starting node =====');
    if (unit == 'compiler') return print('===== Starting compiler =====');

    print('===== Starting node and compiler =====');
}

async function printInitialStopMsg (unit) {
    if (unit == 'node') return print('===== Stopping node  =====');
    if (unit == 'compiler') return print('===== Stopping compiler  =====');

    print('===== Stopping node and compiler  =====');
}

module.exports = {
    start,
    stopAll,
    stopNode,
    stopCompiler,
    stopSeparately,
    getInfo,
    printInfo,
    waitForContainer,
    toggleLoader,
    checkForAllocatedPort,
    printSuccessMsg,
    printStarMsg,
    printInitialStopMsg
}