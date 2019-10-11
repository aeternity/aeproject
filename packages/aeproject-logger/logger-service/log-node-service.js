const fs = require('fs-extra')
const path = require('path')
const {
    spawn
} = require('promisify-child-process');

let instance;
const storageDir = '.aeproject-node-store/.node-store.json'

const dockerConfig = 'docker-compose.yml'
const compilerConfig = 'docker-compose.compiler.yml'

class LogNodeService {
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

        this.store = require(this.nodeStore);
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
        this.writeNodePathToStore();
        this.writeCompilerPathToStore();
    }

    getNodePath () {
        return this.store.node ? this.store.node + dockerConfig : dockerConfig

    } 

    getCompilerPath () {
        return this.store.compiler ? this.store.compiler + compilerConfig : compilerConfig
    }
    clearPaths () {
        this.store = {}
        this.save()
    }

    save () {
        fs.outputJsonSync(this.nodeStore, this.store);
    }

    printValue () {
        // console.log(this.nodeStore); // where the file is gonna be stored
        // console.log(this.dockerComposePath); // where it has been called from
        console.log(this.store.node);
        console.log(this.store.compile);
    }

    async tryToRunDockerAndCompiler () {
        console.log(`${ this.store.node }/${ dockerConfig }`);
        console.log(`${ this.store.compiler }/${ compilerConfig }`);
        
        try {
            let res = await spawn(
                'docker-compose', 
                ['-f',
                    `${ this.store.node }/${ dockerConfig }`,
                    '-f',
                    `${ this.store.compiler }/${ compilerConfig }`,
                    'up',
                    '-d']);
        } catch (error) {
            console.log(Buffer.from(error.stderr).toString('utf-8'));
        }
    }

    async tryToStopDockerAndCompiler () {
        console.log(`${ this.store.path }/${ dockerConfig }`);
        
        try {
            let res = await spawn(
                'docker-compose',
                ['-f',
                    `${ this.store.node }/${ dockerConfig }`,
                    '-f',
                    `${ this.store.compiler }/${ compilerConfig }`,
                    'down',
                    '-v',
                    '--remove-orphans']);

            console.log('tru tur tur');
            
            console.log(Buffer.from(res.stdout).toString('utf-8'));
                    
        } catch (error) {
            console.log('in the error');
            
            console.log(Buffer.from(error.stderr).toString('utf-8'));
        }
    }

    async checkNodeAndCompilersAreUp () {
        try {
            let res = await spawn(
                'docker-compose',
                ['-f',
                    `${ this.store.node }/${ dockerConfig }`,
                    '-f',
                    `${ this.store.compiler }/${ compilerConfig }`,
                    'ps'])
        } catch (error) {
            console.log(Buffer.from(error.stderr).toString('utf-8'));
        }
    }

    static getInstance (_path) {
        if (!instance) {
            instance = new LogNodeService(_path)
        }

        return instance
    }
}

module.exports = {
    LogNodeService
}