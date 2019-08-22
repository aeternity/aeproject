const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
const execute = require('../../packages/aeproject-utils/utils/aeproject-utils.js').aeprojectExecute;
const exec = require('../../packages/aeproject-utils/utils/aeproject-utils.js').execute;
const winExec = require('../../packages/aeproject-utils/utils/aeproject-utils.js').winExec;
const waitForContainer = require('../../packages/aeproject-utils/utils/aeproject-utils.js').waitForContainer;
const waitUntilFundedBlocks = require('../utils').waitUntilFundedBlocks;
const constants = require('../constants.json')
const fs = require('fs-extra');
const nodeConfig = require('../../packages/aeproject-config/config/node-config.json');
const utils = require('../../packages/aeproject-utils/utils/aeproject-utils')
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

let network = utils.config.localhostParams;
network.compilerUrl = utils.config.compilerUrl

const isWindowsPlatform = process.platform === 'win32';

const waitForContainerOpts = {
    dockerImage: nodeConfig.nodeConfiguration.dockerServiceNodeName,
    options: executeOptions
}

describe("AEproject Node and Compiler Tests", () => {

    describe('AEproject Node', () => {

        before(async () => {
            fs.ensureDirSync(`.${ constants.nodeTestsFolderPath }`)

            await execute(constants.cliCommands.INIT, [], executeOptions);
            let result = await execute(constants.cliCommands.NODE, [], executeOptions);
        })

        it('Should start the node successfully', async () => {
            let running = await waitForContainer(waitForContainerOpts.dockerImage, executeOptions);
            assert.isTrue(running, "node wasn't started properly");
        })

        it('Should check if the wallets are funded', async () => {

            let client = await utils.getClient(network);
            await waitUntilFundedBlocks(client, waitForContainerOpts)
            for (let wallet in defaultWallets) {
                let recipientBalanace = await client.balance(defaultWallets[wallet].publicKey, balanceOptions)
                assert.isAbove(Number(recipientBalanace), 0, `${ defaultWallets[wallet].publicKey } balance is not greater than 0`);
            }
        })

        it('Should check if the wallets are funded with the exact amount', async () => {
            let client = await utils.getClient(network);
            for (let wallet in defaultWallets) {
                let recipientBalanace = await client.balance(defaultWallets[wallet].publicKey, balanceOptions)
                assert.equal(recipientBalanace, nodeConfig.config.amountToFund, `${ defaultWallets[wallet].publicKey } balance is not greater than 0`);
            }
        })

        it('Process should start local compiler', async () => {
            let result = await exec(constants.cliCommands.CURL, constants.getCompilerVersionURL);
            let isContainCurrentVersion = result.indexOf(`{"version"`) >= 0;

            assert.isOk(isContainCurrentVersion);
        })

        it('Should stop the node successfully', async () => {
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
            let running = await waitForContainer(waitForContainerOpts.dockerImage, executeOptions);
            assert.isNotTrue(running, "node wasn't stopped properly");
        })

        it('Process should stop when command is started in wrong folder.', async () => {
            let result = await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.START], {
                cwd: process.cwd()
            });

            if (!(result.indexOf('Process will be terminated!') >= 0 || result.indexOf('Process exited with code 1') >= 0)) {
                assert.isOk(false, "Process is still running in wrong folder.")
            }
        })

        after(async () => {

            let running = await waitForContainer(waitForContainerOpts.dockerImage, executeOptions);
            if (running) {
                await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
            }
            fs.removeSync(`.${ constants.nodeTestsFolderPath }`)
        })
    })

    describe('AEproject Node - check if compiler is running too', () => {

        before(async () => {
            fs.ensureDirSync(`.${ constants.nodeTestsFolderPath }`)

            await execute(constants.cliCommands.INIT, [], executeOptions)
            await execute(constants.cliCommands.NODE, [], executeOptions)
        })

        it('Local compiler should be running.', async () => {
            let result = await exec(constants.cliCommands.CURL, constants.getCompilerVersionURL);
            let isContainCurrentVersion = result.indexOf(`{"version"`) >= 0;

            assert.isOk(isContainCurrentVersion);
        })

        after(async () => {

            let running = await waitForContainer(waitForContainerOpts.dockerImage, executeOptions);
            if (running) {
                await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
            }
            fs.removeSync(`.${ constants.nodeTestsFolderPath }`)
        })
    })

    describe('AEproject Node', async () => {
        it('Process should stop when command is started in wrong folder.', async () => {
            let result = await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.START], {
                cwd: process.cwd()
            });

            if (!(result.indexOf('Process will be terminated!') >= 0 || result.indexOf('Process exited with code 1') >= 0)) {
                assert.isOk(false, "Process is still running in wrong folder.")
            }
        })
    })

    describe('AEproject Node --only', () => {

        beforeEach(async () => {
            fs.ensureDirSync(`.${ constants.nodeTestsFolderPath }`)

            await execute(constants.cliCommands.INIT, [], executeOptions)
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.ONLY], executeOptions)
        })

        it('Process should NOT start local compiler', async () => {
            let result = await exec(constants.cliCommands.CURL, constants.getCompilerVersionURL);

            assert.isOk(result.indexOf('Connection refused') >= 0, "There is a port that listening on compiler's port.");
        })

        afterEach(async () => {

            let running = await waitForContainer(waitForContainerOpts.dockerImage, executeOptions);
            if (running) {
                await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
            }
            fs.removeSync(`.${ constants.nodeTestsFolderPath }`)
        })
    })

    describe("AEproject Node -- allocated port's tests", () => {

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

            const isPortAllocated = result.indexOf('is already allocated!') >= 0 ||
                result.indexOf('port is already allocated') >= 0 ||
                result.indexOf(`address already in use`) >= 0;

            // const isSamePort = result.indexOf(`:${ port }`) >= 0;

            assert.isOk(isPortAllocated, 'Node does not throw exception on allocated port!');
            // assert.isOk(isSamePort, 'Error message does not contains expected port!');

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

            const isPortAllocated = result.indexOf('is already allocated!') >= 0 ||
                result.indexOf('port is already allocated') >= 0 ||
                result.indexOf(`address already in use`) >= 0 ||
                result.indexOf(`Process exited with code 125`) >= 0;

            // const isSamePort = result.indexOf(`:${ port }`) >= 0;
            const isNodeStarted = result.indexOf('Node already started and healthy!') >= 0;

            assert.isOk(isPortAllocated || isNodeStarted, 'Local compiler does not throw exception on allocated port!');
            // assert.isOk(isSamePort, 'Error message does not contains expected port!');

            // stop server
            app.close();
        });

        // try to run compiler on custom port
        xit('Process should start local compiler on specific port', async () => {

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

            let running = await waitForContainer(waitForContainerOpts.dockerImage, executeOptions);
            if (running) {
                await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
            }
            fs.removeSync(`.${ constants.nodeTestsFolderPath }`)
        })
    })

    if (isWindowsPlatform) {
        describe("AEproject Node --windows", async () => {

            const dockerServiceNodeName = nodeConfig.nodeConfiguration.dockerServiceNodeName;
            const cliCommand = 'aeproject';

            network = JSON.parse(JSON.stringify(network).replace(/localhost/g, nodeConfig.nodeConfiguration.dockerMachineIP));

            before(async () => {
                fs.ensureDirSync(`.${ constants.nodeTestsFolderPath }`);

                await winExec(cliCommand, constants.cliCommands.INIT, [], executeOptions);
                await winExec(cliCommand, constants.cliCommands.NODE, ['--windows'], executeOptions);
            })

            it('Should start the node successfully', async () => {
                let running = await waitForContainer(dockerServiceNodeName, executeOptions);
                assert.isTrue(running, "node wasn't started properly");
            })

            it('Should check if the wallets are funded', async () => {

                let client = await utils.getClient(network);
                await waitUntilFundedBlocks(client, {
                    blocks: 8,
                    containerName: dockerServiceNodeName,
                    options: executeOptions
                })
                for (let wallet in defaultWallets) {
                    let recipientBalanace = await client.balance(defaultWallets[wallet].publicKey, balanceOptions)
                    assert.isAbove(Number(recipientBalanace), 0, `${ defaultWallets[wallet].publicKey } balance is not greater than 0`);
                }
            })

            it('Should check if the wallets are funded with the exact amount', async () => {
                let client = await utils.getClient(network);
                for (let wallet in defaultWallets) {
                    let recipientBalanace = await client.balance(defaultWallets[wallet].publicKey, balanceOptions)
                    assert.equal(recipientBalanace, nodeConfig.config.amountToFund, `${ defaultWallets[wallet].publicKey } balance is not greater than 0`);
                }
            })

            // this test should be ok when we update init files with ones that contains 2 docker-compose files (compiler one too)
            xit('Process should start local compiler', async () => {
                let result = await exec(constants.cliCommands.CURL, constants.getCompilerVersionURL.replace('localhost', nodeConfig.nodeConfiguration.dockerMachineIP));
                let isContainCurrentVersion = result.indexOf(`{"version"`) >= 0;

                assert.isOk(isContainCurrentVersion);
            })

            it('Should stop the node successfully', async () => {
                await winExec(cliCommand, constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
                let running = await waitForContainer(dockerServiceNodeName, executeOptions);
                assert.isNotTrue(running, "node wasn't stopped properly");
            })

            it('Process should stop when command is started in wrong folder.', async () => {
                let result = await winExec(cliCommand, constants.cliCommands.NODE, ['--windows'], {
                    cwd: process.cwd()
                });

                if (!(result.includes('Process will be terminated!') || result.includes('Process exited with code 1'))) {
                    assert.isOk(false, "Process is still running in wrong folder.")
                }
            })

            after(async () => {

                let running = await waitForContainer(dockerServiceNodeName, executeOptions);
                if (running) {
                    await winExec(cliCommand, constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
                }

                fs.removeSync(`.${ constants.nodeTestsFolderPath }`)
            })
        })
    }
})