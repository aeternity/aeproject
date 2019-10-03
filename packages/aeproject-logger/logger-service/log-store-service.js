const LogJSONStore = require('../logger-store/log-json-store');

const storageDir = './.aeproject-store'
let store;
/**
 * Store for the logs created by the deployment scripts.
 */
class LogStoreService {

    constructor () {
        this._historyStore = LogJSONStore(`${ storageDir }/.history.json`);

        const history = this.getHistory();
        this._HISTORY_ID = '' + history.length;
        this.isInitied = false;
    }

    /**
     * Initializes the history store with default empty array value
     */
    initHistoryRecord () {

        if (this.isInitied) {
            return false;
        }

        const initialRecord = {
            actions: new Array()
        }

        this._historyStore.set(this._HISTORY_ID, initialRecord)
        this.isInitied = true;

        return true;
    }

    /**
     * Gets all stored historical records of deployments
     */
    getHistory () {
        return this._historyStore.list();
    }

    /**
     * Gets the record that logAction is going to be writing at.
     */
    getCurrentWorkingRecord () {
        return this._historyStore.get(this._HISTORY_ID);
    }

    /**
     * Gets the last written record.
     */
    getLastWorkingRecord () {
        const history = this.getHistory();
        return this._historyStore.get('' + (history.length - 1));
    }

    /**
     * 
     * Add a record to the history of deployments
     * @param {*} actionInfo should have those properties: 'deployerType' type of deployer, 'nameOrLabel' name of the contract or label of the transaction, 
     * 'transactionHash' transaction hash if available, 'status' 1 - success, 0 - failure, 'result' arbitrary result text
     */
    logAction (actionInfo) {
        if (!this.isInitied) {
            return;
        }
        let {
            deployerType,
            nameOrLabel,
            transactionHash,
            status,
            gasPrice,
            gasUsed,
            result,
            networkId,
            error,
            initState,
            options,
            publicKey
        } = actionInfo;

        const record = {
            eventTimestamp: Date.now(),
            deployerType,
            nameOrLabel,
            transactionHash,
            status,
            gasPrice,
            gasUsed,
            result,
            networkId,
            error,
            initState,
            options,
            publicKey
        }

        const currentRecord = this.getCurrentWorkingRecord();
        currentRecord.actions.push(record);
        this._historyStore.set(this._HISTORY_ID, currentRecord);
    }
}

class WindowCompatibleLogStore {

    constructor () {}
    initHistoryRecord () {
        return;
    }

    getHistory () {
        return;
    }

    getCurrentWorkingRecord () {
        return;
    }

    getLastWorkingRecord () {
        return;
    }

    logAction (deployerType, nameOrLabel, transactionHash, status, gasPrice, gasUsed, result, networkId) {
        return;
    }
}

if (typeof window === 'undefined') {
    store = new LogStoreService();
} else {
    store = new WindowCompatibleLogStore();
}

module.exports = store;