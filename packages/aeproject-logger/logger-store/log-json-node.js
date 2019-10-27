const path = require('path')
const fs = require('fs-extra')

const storageDir = '../../../.aeproject-node-store/.node-store.json'
const dockerConfig = '/docker-compose.yml'
const compilerConfig = '/docker-compose.compiler.yml'

let instance

class LogJSONNode {
    constructor (_path) {
        // console.log('__dirname', path.resolve('../', __dirname) + storageDir)
        // // this.globalStore = './../' + __dirname
        // console.log('101.1 LogJSONNode', process.cwd())
        // console.log('101.2 LogJSONNode', _path)
        // console.log('101.31 LogJSONNode', path.resolve(`${ path.dirname(require.main.filename) }/${ storageDir }`))
        // console.log('101.32 LogJSONNode', path.join(`${ _path }/${ storageDir }`))
        // console.log('101.33 PathToSaveNodeStore', path.resolve('../', __dirname) + storageDir);
        // OK
        console.log('101.34 PathToSaveNodeStoreGlobally', path.resolve(__dirname, storageDir));
        // this.nodeStore = path.resolve(`${_path}/${storageDir}`)
        this.nodeStore = path.resolve(__dirname, storageDir);
        
        // this.dockerComposePath = _path + '/';
        this.dockerComposePath = this.nodeStore;
        // this.compilerPath = _path + '/'
        this.compilerPath = this.nodeStore

        // console.log('>>>> dockerComposePath in thge constructor In the ', this.dockerComposePath);

        if (this.ensureStoreExists()) {
            console.log('101.5 LogJSONNode this.dockerComposePath', this.dockerComposePath)
            console.log('101.6 LogJSONNode this.compilerPath', this.compilerPath)
            
            fs.outputJsonSync(this.nodeStore, {
                node: '', // this.dockerComposePath,
                compiler: '' // this.compilerPath
            });
        }

        this.store = require(this.nodeStore)
    }

    ensureStoreExists () {
        return !fs.existsSync(this.nodeStore)
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
        console.log('201.1', this.store);
        console.log('201.2', process.cwd());
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
        // console.log('110.1 getNodePath this.nodeStore');
        // console.log(this.nodeStore);
        // console.log();
        
        // console.log('110.2 getNodePath this.store.node');
        // console.log(this.store.node);
        // console.log();

        return this.store.node
    }

    getCompilerPath () {
        return this.store.compiler
    }

    save () {
        // ./../__filename
        // // get file path
        // ??? aepp-aeproject-js path
        console.log('300 KYP', this.store)
        console.log('300 1 KYP', this.nodeStore)
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