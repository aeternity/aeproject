const LogJSONNode = require('../logger-store/log-json-node');
const {
    spawn
} = require('promisify-child-process');
// const {
//     print
// } = require('aeproject-utils');

class LogNodeService {
    constructor (_path) {
        this._nodeStore = LogJSONNode(_path)
    }

    getNodePath () {
        return this._nodeStore.getNodePath()
    }

    getCompilerPath () {
        return this._nodeStore.getCompilerPath()
    }

    deletePaths () {
        return this._nodeStore.clearPaths()
    }

    save (unit) {
        
        if (unit === 'compiler') {
            return this._nodeStore.writeCompilerPathToStore()
            
        }
        if (unit === 'node') {
            return this._nodeStore.writeNodePathToStore()
            
        }

        return this._nodeStore.writeNodeAndCompilerToStore()
    }

    async start (option) {
        if (option) {
            spawn('docker-compose', ['-f', 'docker-compose.yml', 'up', '-d']);
            return this.save('node');
        } else {
            spawn('docker-compose', ['-f', 'docker-compose.yml', '-f', 'docker-compose.compiler.yml', 'up', '-d']);
            return this.save();
        }
    }

    async stop () {

        if (this.getNodePath() && this.getCompilerPath()) {
            console.log('node and compiler');
            
            spawn('docker-compose', [
                '-f',
                `${ this.getNodePath() }`,
                '-f',
                `${ this.getCompilerPath() }`,
                'down',
                '-v',
                '--remove-orphans'
            ]);

            console.log('===== Node was successfully stopped! =====');
            console.log('===== Compiler was successfully stopped! =====');
        } else if (this.getNodePath()) {
            console.log('only node');
            
            spawn('docker-compose', [
                '-f',
                `${ this.getNodePath() }`,
                'down',
                '-v',
                '--remove-orphans'
            ]);

            console.log('===== Node was successfully stopped! =====');
        } else if (this.getCompilerPath()) {
            console.log('compiler');
            
            spawn('docker-compose', [
                '-f',
                `${ this.getCompilerPath() }`,
                'down',
                '-v',
                '--remove-orphans'
            ]);
            console.log('===== Compiler was successfully stopped! =====');
        }

        return this.deletePaths()
    }

    async dockerComposePs (options) {
        let result;
        let nodePath = this.getNodePath()
        let compilerPath = this.getCompilerPath()

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
        }

        return result
    }
}

module.exports = {
    LogNodeService
}