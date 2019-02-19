const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const fs = require('fs-extra');
const assert = chai.assert;
const execute = require('../../cli-commands/utils').forgaeExecute;
const timeout = require('../../cli-commands/utils').timeout;
const utils = require('../../cli-commands/utils');
const forgaeContracts = require('../../cli-commands/forgae-contracts/forgae-contracts');
const sinon = require('sinon');
const constants = require('../constants.json');
const {
  spawn
} = require('promisify-child-process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const LOG_FILE = './contractLogFile.log';
const LOCALHOST_SUCCESS = 'Contracts web Aepp is running';

let executeOptions = {
  cwd: process.cwd() + constants.testTestsFolderPath
};

describe('ForgAE contracts', () => {
  let contractsResult;

  before(async function () {
    fs.ensureDirSync(`.${constants.testTestsFolderPath}`);
    await execute(constants.cliCommands.INIT, [], executeOptions);
    await execute(constants.cliCommands.NODE, [], executeOptions);
  });

  it('should execute contracts cli command correctly', async function () {
    const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
    contractsResult = spawn('forgae', [constants.cliCommands.CONTRACTS], {});
    contractsResult.stdout.pipe(logStream);
    await timeout(100000);
    const logContent = fs.readFileSync(LOG_FILE, 'utf8');
    console.log(logContent);
    assert.include(logContent, LOCALHOST_SUCCESS);
  });

  after(async function () {
    await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
    fs.removeSync(`.${constants.testTestsFolderPath}`);
    await exec('kill $(lsof -t -i:8080)');
    fs.removeSync(LOG_FILE);
  })
});