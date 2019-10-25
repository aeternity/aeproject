const LogJSONNode = require('../logger-store/log-json-node');

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

    delete (unit) {
        if (unit === 'compiler') {
            return this._nodeStore.deleteCompilerPathFromStore()

        }
        if (unit === 'node') {
            return this._nodeStore.deleteNodePathFromStore()

        }
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
}

module.exports = {
    LogNodeService
}