let { LogNodeService } = require('aeproject-logger')
let nodeService = new LogNodeService(process.cwd())
const {
    spawn
} = require('promisify-child-process');
const {
    print
} = require('./fs-utils')
const readErrorSpawnOutput = require('./aeproject-utils').readErrorSpawnOutput

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
        // TODO see why readErrorSpawnOutput is not working
        if (Buffer.from(error.stderr).toString('utf8').indexOf('active endpoints')) {
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
        // TODO see why readErrorSpawnOutput is not working
        if (Buffer.from(error.stderr).toString('utf8').indexOf('active endpoints')) {
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

module.exports = {
    start,
    stopAll,
    stopSeparately,
    info
}