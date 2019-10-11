const path = require('path')
const fs = require('fs-extra')

const storageDir = '.aeproject-node-store/.node-store.json'
const dockerConfig = 'docker-compose.yml'
const compilerConfig = 'docker-compose.compiler.yml'

let instance

class LogJSONNode {
    constructor (_path) {
        this.nodeStore = path.resolve(`${ path.dirname(require.main.filename) }/${ storageDir }`)
        this.dockerComposePath = _path + '/';
        this.compilerPath = _path + '/'

        if (this.ensureStoreExists()) {
            
            fs.outputJsonSync(this.nodeStore, {
                node: this.dockerComposePath,
                compiler: this.compilerPath
            });
        }

        this.store = require(this.nodeStore)
    }

    ensureStoreExists () {
        return !fs.existsSync(this.nodeStore)
    }

    writeNodePathToStore () {
        this.store.node = this.dockerComposePath
        this.save()
    }

    writeCompilerPathToStore () {
        this.store.compiler = this.dockerComposePath
        this.save()
    }

    writeNodeAndCompilerToStore () {
        this.writeNodePathToStore()
        this.writeCompilerPathToStore()
    }

    getNodePath () {
        return this.store.node ? this.store.node + dockerConfig : path.resolve(dockerConfig)
    }

    getCompilerPath () {
        return this.store.compiler ? this.store.compiler + compilerConfig : compilerConfig
    }
    clearPaths (newStore) {
        this.store = newStore
        this.save()
    }

    save () {
        fs.outputJsonSync(this.nodeStore, this.store);
    }

    static getInstance (_path) {

        if (!instance) {
            instance = new LogJSONNode(_path)
        }

        return instance
    }

}

module.exports = function (_path) {
    return LogJSONNode.getInstance(_path)
}