const path = require('path')
const fs = require('fs-extra')

const storageDir = '../../.aeproject-node-store/.node-store.json'
const dockerConfig = 'docker-compose.yml'
const compilerConfig = 'docker-compose.compiler.yml'

let instance

class LogJSONNode {
    constructor (_path) {
        this.nodeStore = path.resolve(`${ path.dirname(require.main.filename) }/${ storageDir }`)
        
        this.dockerComposePath = _path + '/';
        this.compilerPath = _path + '/'

        console.log('>>>> dockerComposePath in thge constructor In the ', this.dockerComposePath);

        if (this.ensureStoreExists()) {
            console.log('if in the constructor >>>>> ', process.cwd())
            
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
        this.store.node = path.resolve(this.dockerComposePath + dockerConfig)
        this.save()
    }

    writeCompilerPathToStore () {
        this.store.compiler = path.resolve(this.compilerPath + compilerConfig)
        this.save()
    }

    writeNodeAndCompilerToStore () {
        this.writeNodePathToStore()
        this.writeCompilerPathToStore()
        console.log('>>>> 1 this.store', this.store);
        
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
        console.log('this.nodeStore path on geth>>>>>>>>>');
        console.log(this.nodeStore);
        console.log('=====================');
        
        console.log('node path saved in the nodeStore >>>>>>>>>');
        console.log(this.store.node);
        console.log('=====================');

        return this.store.node
    }

    getCompilerPath () {
        return this.store.compiler
    }

    save () {
        console.log('on save method');
        
        console.log('node store path ==>>>>>', this.nodeStore);
        console.log('node path saved ==>>>>>', this.store.node);

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