let { LogNodeService } = require('aeproject-logger')
let nodeService = new LogNodeService(process.cwd())
const {
    spawn
} = require('promisify-child-process');
const {
    print
} = require('./fs-utils')
const {
    readSpawnOutput, 
    readErrorSpawnOutput
} = require('./aeproject-utils');

async function start (option) {
    if (option.only) {
        spawn('docker-compose', ['-f', 'docker-compose.yml', 'up', '-d']);
        return nodeService.save('node');
    } else if (option.onlyCompiler) {
        spawn('docker-compose', ['-f', 'docker-compose.compiler.yml', 'up', '-d']);
        return nodeService.save('compiler');
    } else {
        spawn('docker-compose', ['-f', 'docker-compose.yml', '-f', 'docker-compose.compiler.yml', 'up', '-d']);
        return nodeService.save();
    }
}

async function stopAll () {
    
    if (nodeService.getNodePath() && nodeService.getCompilerPath()) {
        await stopNode()
        await stopCompiler()
    } else if (nodeService.getNodePath()) {
        await stopNode()
    } else if (nodeService.getCompilerPath()) {
        await stopCompiler()
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

        return nodeService.delete('node')
    } catch (error) {
        if (readErrorSpawnOutput(error).indexOf('active endpoints')) {
            nodeService.delete('node')
            return print('===== Node was successfully stopped! =====');
        } 
        
        throw new Error(error)
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
        
        return nodeService.delete('compiler')
    } catch (error) {
        if (readErrorSpawnOutput(error).indexOf('active endpoints')) {
            nodeService.delete('compiler')
            return print('===== Compiler was successfully stopped! =====');
        }

        throw new Error(error)
    }
    
}

function stopSeparately (options) {
    return options.only ? stopNode() : stopCompiler()
}

async function info (options) {
    let result;
    let nodePath = nodeService.getNodePath()
    let compilerPath = nodeService.getCompilerPath()

    if (nodePath && compilerPath) {        
        result = await spawn('docker-compose', [
            '-f',
            `${ nodePath }`,
            '-f',
            `${ compilerPath }`,
            'ps'
        ], options);
    } else if (nodePath) {
        result = await spawn('docker-compose', ['-f', `${ nodePath }`, 'ps'], options)
    } else if (compilerPath) {
        result = await spawn('docker-compose', ['-f', `${ compilerPath }`, 'ps'], options)
    } else {
        
        result = await spawn('docker-compose', [
            '-f',
            `${ 'docker-compose.yml' }`,
            '-f',
            `${ 'docker-compose.compiler.yml' }`,
            'ps'
        ], options);
    }

    return result
}

async function waitForContainer (image, options) {

    try {
        let running = false;

        let result = await info(options);
        let res = readSpawnOutput(result);

        if (res) {
            res = res.split('\n');
        }

        if (Array.isArray(res)) {
            res.map(line => {
                if (line.indexOf(image) >= 0 && line.includes('healthy')) {
                    running = true
                }
            })
        }

        return running;
    } catch (error) {

        if (checkForMissingDirectory(error)) {
            return false
        }

        if (error.stderr) {

            console.log(error.stderr.toString('utf8'))
        } else {
            console.log(error.message || error)
        }

        throw Error(error);
    }
}

function checkForMissingDirectory (e) {
    return (e.stderr && e.stderr.toString('utf-8').indexOf('No such file or directory'))
}

function printSuccessMsg (option) {
    if (option.only) return print('\n\r===== Node was successfully started! =====');
    if (option.onlyCompiler) return print('\n\r===== Compiler was successfully started! =====');
   
    print('\n\r===== Node was successfully started! =====');
    print('===== Compiler was successfully started! =====');
    print('===== Funding default wallets! =====');
}

function printStarMsg (option) {
    if (option.only) return print('===== Starting node =====');
    if (option.onlyCompiler) return print('===== Starting compiler =====')

    print('===== Starting node and compiler =====');
}

async function printInitialStopMsg (option) {
    if (option.only) return print('===== Stopping node  =====')
    if (option.onlyCompiler) return print('===== Stopping compiler  =====')

    print('===== Stopping node and compiler  =====')
}

module.exports = {
    start,
    stopAll,
    stopSeparately,
    info,
    waitForContainer,
    printSuccessMsg,
    printStarMsg,
    printInitialStopMsg
}