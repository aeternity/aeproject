const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
const execute = require('../../packages/forgae-utils/utils/forgae-utils.js').forgaeExecute;
const exec = require('../../packages/forgae-utils/utils/forgae-utils.js').execute;
const waitForContainer = require('../utils').waitForContainer;
const waitUntilFundedBlocks = require('../utils').waitUntilFundedBlocks;
const constants = require('../constants.json')
const fs = require('fs-extra')
const nodeConfig = require('../../packages/forgae-config/config/node-config.json')
const utils = require('../../packages/forgae-utils/utils/forgae-utils')
let executeOptions = {
    cwd: process.cwd() + constants.nodeTestsFolderPath
};
chai.use(chaiAsPromised);
const assert = chai.assert;

const http = require('http');

const defaultWallets = nodeConfig.defaultWallets
let balanceOptions = {
    format: false
}

describe('ForgAE Node', () => {

    before(async () => {
        fs.ensureDirSync(`.${ constants.nodeTestsFolderPath }`)

        await execute(constants.cliCommands.INIT, [], executeOptions)
        await execute(constants.cliCommands.NODE, [], executeOptions)
    })

    it('Should start the node successfully', async () => {
        let running = await waitForContainer();
        assert.isTrue(running, "node wasn't started properly");
    })

    it('Should check if the wallets are funded', async () => {

        let client = await utils.getClient(utils.config.localhostParams);
        await waitUntilFundedBlocks(client)
        for (let wallet in defaultWallets) {
            let recipientBalanace = await client.balance(defaultWallets[wallet].publicKey, balanceOptions)
            assert.isAbove(Number(recipientBalanace), 0, `${ defaultWallets[wallet].publicKey } balance is not greater than 0`);
        }
    })

    it('Should check if the wallets are funded with the exact amount', async () => {
        let client = await utils.getClient(utils.config.localhostParams);
        for (let wallet in defaultWallets) {
            let recipientBalanace = await client.balance(defaultWallets[wallet].publicKey, balanceOptions)
            assert.equal(recipientBalanace, nodeConfig.config.amountToFund, `${ defaultWallets[wallet].publicKey } balance is not greater than 0`);
        }
    })

    it('Process should start local compiler', async () => {
        let result = await exec(constants.cliCommands.CURL, constants.getCompilerVersionURL);
        let isContainCurrentVersion = result.indexOf(`{"version":"${ nodeConfig.localCompiler.imageVersion.replace('v', '') }"}`) >= 0;

        assert.isOk(isContainCurrentVersion);
    })

    it('Should stop the node successfully', async () => {
        await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
        let running = await waitForContainer();
        assert.isNotTrue(running, "node wasn't stopped properly");
    })

    it('Process should stop when command is started in wrong folder.', async () => {
        let result = await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.START], {
            cwd: process.cwd()
        });

        if (result.indexOf('Process will be terminated!') < 0) {
            assert.isOk(false, "Process is still running in wrong folder.")
        }
    })

    after(async () => {

        let running = await waitForContainer();
        if (running) {
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
        }
        fs.removeSync(`.${ constants.nodeTestsFolderPath }`)
    })
})

describe('ForgAE Node - check if compiler is running too', () => {

    before(async () => {
        fs.ensureDirSync(`.${ constants.nodeTestsFolderPath }`)

        await execute(constants.cliCommands.INIT, [], executeOptions)
        await execute(constants.cliCommands.NODE, [], executeOptions)
    })

    it('Local compiler should be running.', async () => {
        let result = await exec(constants.cliCommands.CURL, constants.getCompilerVersionURL);
        let isContainCurrentVersion = result.indexOf(`{"version":"${ nodeConfig.localCompiler.imageVersion.replace('v', '') }"}`) >= 0;

        assert.isOk(isContainCurrentVersion);
    })

    after(async () => {

        let running = await waitForContainer();
        if (running) {
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
        }
        fs.removeSync(`.${ constants.nodeTestsFolderPath }`)
    })
})

describe('ForgAE Node', async () => {
    it('Process should stop when command is started in wrong folder.', async () => {
        let result = await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.START], {
            cwd: process.cwd()
        });

        if (result.indexOf('Process will be terminated!') < 0) {
            assert.isOk(false, "Process is still running in wrong folder.")
        }
    })
})

describe('ForgAE Node --only', () => {

    beforeEach(async () => {
        fs.ensureDirSync(`.${ constants.nodeTestsFolderPath }`)

        await execute(constants.cliCommands.INIT, [], executeOptions)
        await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.ONLY], executeOptions)
    })

    it('Process should NOT start local compiler', async () => {
        await assert.isRejected(exec(constants.cliCommands.CURL, constants.getCompilerVersionURL), 'Process exited with code 7');
    })

    afterEach(async () => {

        let running = await waitForContainer();
        if (running) {
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
        }
        fs.removeSync(`.${ constants.nodeTestsFolderPath }`)
    })
})

describe("ForgAE Node -- allocated port's tests", () => {

    before(async () => {
        fs.ensureDirSync(`.${ constants.nodeTestsFolderPath }`)

        await execute(constants.cliCommands.INIT, [], executeOptions);
    })

    // try to run AE node on already allocated port , process should stop
    it('Process should NOT start AE node', async () => {

        const port = 3001;

        // Create an instance of the http server to handle HTTP requests
        let app = http.createServer((req, res) => {

            // Set a response type of plain text for the response
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });

            // Send back a response and end the connection
            res.end('Hello World!\n');
        });

        // Start the server on specific port
        app.listen(port);

        // test
        let result = await execute(constants.cliCommands.NODE, [], executeOptions);
        const isPortAllocated = result.indexOf('port is already allocated') >= 0;
        const isSamePort = result.indexOf(`:${ port }`) >= 0;

        assert.isOk(isPortAllocated, 'Node does not throw exception on allocated port!');
        assert.isOk(isSamePort, 'Error message does not contains expected port!');

        // stop server
        app.close();
    });

    // try to run compiler on already allocated port, process should stop
    it('Process should NOT start local compiler', async () => {

        const port = 3080;

        // Create an instance of the http server to handle HTTP requests
        let app = http.createServer((req, res) => {

            // Set a response type of plain text for the response
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });

            // Send back a response and end the connection
            res.end('Hello World!\n');
        });

        // Start the server on specific port
        app.listen(port);

        // test
        let result = await execute(constants.cliCommands.NODE, [], executeOptions);
        const isPortAllocated = result.indexOf('port is already allocated') >= 0;
        const isSamePort = result.indexOf(`:${ port }`) >= 0;

        assert.isOk(isPortAllocated, 'Local compiler does not throw exception on allocated port!');
        assert.isOk(isSamePort, 'Error message does not contains expected port!');

        // stop server
        app.close();
    });

    // try to run compiler on custom port
    it('Process should start local compiler on specific port', async () => {

        const port = 4080;

        // test
        let result = await execute(constants.cliCommands.NODE, [
            constants.cliCommandsOptions.COMPILER_PORT,
            port
        ], executeOptions);

        const isSuccessfullyStarted = result.indexOf(`Local Compiler was successfully started on port:${ port }`) >= 0;

        assert.isOk(isSuccessfullyStarted, 'Local compiler does not start on specific port!');
    });

    after(async () => {

        let running = await waitForContainer();
        if (running) {
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
        }
        fs.removeSync(`.${ constants.nodeTestsFolderPath }`)
    })
})