const path = require('path')
const fs = require('fs-extra')

const storageDir = '../.aeproject-node-store/.node-store.json'
const dockerConfig = '/docker-compose.yml'
const compilerConfig = '/docker-compose.compiler.yml'

let instance

class LogJSONNode {
    constructor () {
        this.nodeStorePath = path.resolve(__dirname, storageDir);

        if (this.ensureStoreExists()) {
            fs.outputJsonSync(this.nodeStorePath, {
                node: '', 
                compiler: ''
            });
        }

        this.store = require(this.nodeStorePath)
    }

    ensureStoreExists () {
        return !fs.existsSync(this.nodeStorePath)
    }

    writeNodePathToStore () {
        this.store.node = path.resolve(process.cwd() + dockerConfig)
        this.save()
    }

    writeCompilerPathToStore () {
        this.store.compiler = path.resolve(process.cwd() + compilerConfig)
        this.save()
    }

    writeNodeAndCompilerToStore () {
        this.writeNodePathToStore()
        this.writeCompilerPathToStore()
    }

    deleteCompilerPathFromStore () {
        this.store.compiler = "";
        this.save()
    }

    deleteNodePathFromStore () {
        this.store.node = "";
        this.save()
    }
    clearPaths () {
        this.store = {}
        this.save()
    }

    getNodePath () {
        return this.store.node
    }

    getCompilerPath () {
        return this.store.compiler
    }

    save () {
        fs.outputJsonSync(this.nodeStorePath, this.store);
    }

    static getInstance () {

        if (!instance) {
            instance = new LogJSONNode()
        }

        return instance
    }

}

module.exports = function () {
    return LogJSONNode.getInstance()
}