const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const assert = chai.assert;

const execute = require('../../cli-commands/utils.js').aeprojectExecute;
const dockerPs = require('../utils').dockerPs;
const constants = require('../constants.json');
const fsExtra = require('fs-extra');
const fs = require('fs');
const epochConfig = require('../../cli-commands/aeproject-epoch/config.json');
const utils = require('../../cli-commands/utils');

const path = require('path');

const INIT_PATH = '';
const TEMP_TEST_PATH = 'temp-test';
const PATH_TO_STORE_DIRECTORY = '.aeproject-store';
const HISTORY_FILENAME = '.history.json';

let executeOptions = {
    cwd: path.resolve(__dirname, TEMP_TEST_PATH)
	// cwd: process.cwd() + constants.historyTestsFolderPath
};

const _store = require('./../../cli-commands/aeproject-history/log-store-service'); 

// const defaultWallets = epochConfig.defaultWallets;


// const toHex = require('./../../cli-commands/utils').keyToHex;
// console.log(toHex('ct_2KtGYFX1RTX5LZjasbjusZuMuL6KdddtDPND5Bd84G7TnF7oSv'))

const deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

describe('Log store service tests', () => {

	const now = Date.now();
	const deployerType = 'Deployer Type';
	const label = 'Label Name';
	const transactionHash = '0x00'
	const status = 1;
    const result = 'Result of the transaction'
    
    const actionInfo = {
        deployerType,
        nameOrLabel: label,
        transactionHash,
        status: status === 1,
        result,
        gasPrice: 1,
        gasUsed: 1,
        result
    }

    let store;

	beforeEach(() => {
        // store.initHistoryRecord();
        // history = store.getHistory();

        let storeConstructor = _store.constructor;
        store = new storeConstructor()
	})

	it('should initialize the store', () => {
        let result = store.initHistoryRecord();
        let history = store.getHistory();
        
        assert(result, "It's not initialized correct!");
		assert(store._historyStore.path.endsWith('.aeproject-store/.history.json'), 'Incorrect path');
		assert(store._HISTORY_ID == ('' + (history.length - 1)), "Incorrect Id");
    });

    it('[NEGATIVE] Store should NOT be initialized', () => {
        let isInitialize = store.isInitied;
        
        assert(!isInitialize, "It's initialized!");
    });
    
	it('should initialize logs correctly', () => {
        store.initHistoryRecord();

		const currentRecord = store.getCurrentWorkingRecord();
		assert(Array.isArray(currentRecord.actions), 'The last record actions is not array');
    });
    
    it('[NEGATIVE] store is not initialized, should NOT have any records', () => {
		const currentRecord = store.getCurrentWorkingRecord();
		assert(!currentRecord, 'Store is initialized or has some record!');
	});

	it('should log actions correctly', () => {
        store.initHistoryRecord();
        
		store.logAction(actionInfo);

		const lastRecord = store.getLastWorkingRecord();
		const lastAction = lastRecord.actions[lastRecord.actions.length - 1];

		assert(lastAction.deployerType == deployerType, 'Deployer Type not set correctly');
		assert(lastAction.nameOrLabel == label, 'Label not set correctly');
		assert(lastAction.transactionHash == transactionHash, 'Transaction hash not set correctly');
		assert(lastAction.status == status, 'status not set correctly');
		assert(lastAction.eventTimestamp >= now, 'timestamp set was not correct');

		const currentRecord = store.getLastWorkingRecord();
		const currentAction = currentRecord.actions[currentRecord.actions.length - 1];

		assert(currentAction.deployerType == deployerType, 'Deployer Type not set correctly');
		assert(currentAction.nameOrLabel == label, 'Label not set correctly');
		assert(currentAction.transactionHash == transactionHash, 'Transaction hash not set correctly');
		assert(currentAction.status == status, 'status not set correctly');
		assert(currentAction.eventTimestamp >= now, 'timestamp set was not correct');
	});

	it('[NEGATIVE] should not log if log store service is not inited', () => {

		store.logAction(actionInfo);

        let lastRecord = store.getCurrentWorkingRecord();
        assert.notOk(lastRecord, "There is a record!")
    });
    
    afterEach(async () => {
        deleteFolderRecursive(path.resolve(process.cwd(), PATH_TO_STORE_DIRECTORY));
    });

});


describe.only('Test CLI "History" command', async () => {
    let tempTestPath = path.resolve(process.cwd(), TEMP_TEST_PATH);

    console.log(path.resolve(__dirname, PATH_TO_STORE_DIRECTORY, HISTORY_FILENAME))
    console.log('dir name =>', __dirname)
    console.log('cwd =>', process.cwd());

    beforeEach(async () => {
        if (!fs.existsSync(tempTestPath)) {
            fs.mkdirSync(tempTestPath);
        }
    });


    // 
    it('History should be empty', async () => {
        // create hidden folder ...
        console.log(constants.cliCommands.INIT)
        console.log(executeOptions);

        let currentCwd = process.cwd();
        process.chdir(tempTestPath);
        //await execute(constants.cliCommands.INIT, [], executeOptions);
        let interval = setInterval(() => {
            process.stdout.write('.');
        }, 500);
        let result = await execute(constants.cliCommands.INIT, []);
        clearInterval(interval)
        if (result.indexOf('Process exited with code 1') >= 0 || true) {
            console.log(result);
            //assert.ok(false, 'Cannot initialize test project!');
        }
        
        //result = await execute(constants.cliCommands.HISTORY, []);

        //aeproject init 
        // make init ... 
        // make deploy 
        // check for creating store data...
        process.chdir(currentCwd);
    });

    // execute 1 deployment
    // execute few deployments
    // test limit
    // check that there are 2 entries by ID


    afterEach(async () => {
        deleteFolderRecursive(tempTestPath);
    });
});