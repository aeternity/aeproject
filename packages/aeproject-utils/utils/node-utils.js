let { LogNodeService } = require('aeproject-logger')
let nodeService = new LogNodeService()
const {
    spawn
} = require('promisify-child-process');
const {
    print
} = require('./fs-utils')

async function start (option) {
    if (option) {
        spawn('docker-compose', ['-f', 'docker-compose.yml', 'up', '-d']);
        return nodeService.save('node');
    } else {
        spawn('docker-compose', ['-f', 'docker-compose.yml', '-f', 'docker-compose.compiler.yml', 'up', '-d']);
        return nodeService.save();
    }
}

async function stop () {

    if (nodeService.getNodePath() && nodeService.getCompilerPath()) {

        spawn('docker-compose', [
            '-f',
            `${ nodeService.getNodePath() }`,
            '-f',
            `${ nodeService.getCompilerPath() }`,
            'down',
            '-v',
            '--remove-orphans'
        ]);

        print('===== Node was successfully stopped! =====');
        print('===== Compiler was successfully stopped! =====');
    } else if (nodeService.getNodePath()) {
        spawn('docker-compose', [
            '-f',
            `${ nodeService.getNodePath() }`,
            'down',
            '-v',
            '--remove-orphans'
        ]);

        print('===== Node was successfully stopped! =====');
    } else if (nodeService.getCompilerPath()) {

        spawn('docker-compose', [
            '-f',
            `${ nodeService.getCompilerPath() }`,
            'down',
            '-v',
            '--remove-orphans'
        ]);
        print('===== Compiler was successfully stopped! =====');
    }

    return nodeService.deletePaths()
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
    stop,
    info
}