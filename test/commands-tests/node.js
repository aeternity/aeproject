const path = require('path');
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

const util = require('util');
const cliExec = util.promisify(require('child_process').exec);

let mainDir = process.cwd();
let nodeTestDir = process.cwd() + constants.nodeTestsFolderPath;

let network = utils.config.localhostParams;
network.compilerUrl = utils.config.compilerUrl

const isWindowsPlatform = process.platform === 'win32';

const waitForContainerOpts = {
    dockerImage: nodeConfig.nodeConfiguration.dockerServiceNodeName,
    compilerImage: nodeConfig.nodeConfiguration.dockerServiceCompilerName,
    options: executeOptions
}

describe.only("AEproject Node and Compiler Tests", async () => {

    async function linkLocalUtilsToProject () {
        process.chdir(path.resolve(nodeTestDir));

        await cliExec('yarn link aeproject-utils')
        await cliExec('yarn link aeproject-logger')

        process.chdir(mainDir)
    }

    await linkLocalUtilsToProject()

    describe('AEproject Node', () => {
        before(async () => {
            fs.ensureDirSync(`.${ constants.nodeTestsFolderPath }`)
            await execute(constants.cliCommands.INIT, [], executeOptions);
            await execute(constants.cliCommands.NODE, [], executeOptions);

        })

        it('Should start the node successfully', async () => {
            // We need to change directory where docker-compose config is located, so we can gather proper information for the node
            process.chdir(nodeTestDir)
            
            let running = await waitForContainer(waitForContainerOpts.dockerImage);

            assert.isTrue(running, "node wasn't started properly");

            process.chdir(mainDir)
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
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
            process.chdir(mainDir)
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
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)

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

    describe('AEproject Node --only && --only-compiler', () => {

        before(async () => {
            fs.ensureDirSync(`.${ constants.nodeTestsFolderPath }`)

            await execute(constants.cliCommands.INIT, [], executeOptions)
            process.chdir(nodeTestDir)
        })

        it('Process should NOT start local compiler', async () => {
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.ONLY], executeOptions)

            let result = await exec(constants.cliCommands.CURL, constants.getCompilerVersionURL);

            assert.isOk(result.indexOf('Connection refused') >= 0, "There is a port that listening on compiler's port.");
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
        })

        it('Process should start local nodes only', async () => {
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.ONLY], executeOptions)

            let dockerRunning = await waitForContainer(waitForContainerOpts.dockerImage);
            let compilerRunning = await waitForContainer(waitForContainerOpts.compilerImage);

            assert.isTrue(dockerRunning, 'node were not started successfully')
            assert.isNotTrue(compilerRunning, "compiler should not be running");

            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP, constants.cliCommandsOptions.ONLY], executeOptions)
        })

        it('Process should start local compiler only', async () => {
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.ONLYCOMPILER], executeOptions)

            let compilerRunning = await waitForContainer(waitForContainerOpts.compilerImage);
            let dockerRunning = await waitForContainer(waitForContainerOpts.dockerImage);
            
            assert.isTrue(compilerRunning, 'compiler was not started')
            assert.isNotTrue(dockerRunning, "node should not be running");

            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP, constants.cliCommandsOptions.ONLYCOMPILER], executeOptions)
        })

        it('Process should NOT start local nodes', async () => {
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.ONLYCOMPILER], executeOptions)

            let result = await exec(constants.cliCommands.CURL, constants.getNodeVersionURL);

            assert.isOk(result.indexOf('Connection refused') >= 0, "There is a port that listening on compiler's port.");
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP, constants.cliCommandsOptions.ONLYCOMPILER], executeOptions)

        })

        it('Process should start local compiler while the node images are already running', async () => {
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.ONLY], executeOptions)

            let dockerRunning = await waitForContainer(waitForContainerOpts.dockerImage);
            let compilerRunning = await waitForContainer(waitForContainerOpts.compilerImage);

            assert.isTrue(dockerRunning, 'node was not started successfully')
            assert.isFalse(compilerRunning, 'compiler is running')

            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.ONLYCOMPILER], executeOptions)
            compilerRunning = await waitForContainer(waitForContainerOpts.compilerImage);
            
            assert.isTrue(compilerRunning, 'compiler was not started successfully')
            
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
        })

        it('Process should start local node while the compiler image is already running', async () => {
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.ONLYCOMPILER], executeOptions)

            let dockerRunning = await waitForContainer(waitForContainerOpts.dockerImage);
            let compilerRunning = await waitForContainer(waitForContainerOpts.compilerImage);

            assert.isTrue(compilerRunning, 'compiler was not started successfully')
            assert.isFalse(dockerRunning, 'docker is running')

            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.ONLY], executeOptions)

            dockerRunning = await waitForContainer(waitForContainerOpts.dockerImage);
            
            assert.isTrue(dockerRunning, 'node was not started successfully')
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
        })

        it('Process should stop only the nodes', async () => {
            await execute(constants.cliCommands.NODE, [], executeOptions)
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP, constants.cliCommandsOptions.ONLY])
            
            let dockerRunning = await waitForContainer(waitForContainerOpts.dockerImage);
            assert.isNotTrue(dockerRunning, 'node was not stopped successfully')
        })
        it('Process should stop only the compiler', async () => {
            await execute(constants.cliCommands.NODE, [], executeOptions)
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP, constants.cliCommandsOptions.ONLYCOMPILER])

            let compilerRunning = await waitForContainer(waitForContainerOpts.compilerImage);
            assert.isNotTrue(compilerRunning, 'compiler was not stopped successfully')
        })

        after(async () => {
            process.chdir(mainDir)
            fs.removeSync(`.${ constants.nodeTestsFolderPath }`)
        })
    })

    describe('Aeproject Node --info', () => {
        before(async () => {
            fs.ensureDirSync(`.${ constants.nodeTestsFolderPath }`)
            await execute(constants.cliCommands.INIT, [], executeOptions)
        })

        it('Should display info that node is not running', async () => {
            let result = await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.INFO], executeOptions)
            assert.isOk(result.indexOf('Node is not running') >= 0, "Nodes are running");
        })

        it('Should display info for running instances', async () => {
            await execute(constants.cliCommands.NODE, [], executeOptions)

            let result = await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.INFO], executeOptions)

            assert.isOk(result.indexOf('node1') >= 0, "Nodes are running");
            assert.isOk(result.indexOf('node2') >= 0, "Nodes are running");
            assert.isOk(result.indexOf('compiler') >= 0, "Nodes are running");
        })
        it('Should display info for compiler only', async () => {
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.ONLYCOMPILER], executeOptions)

            let result = await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.INFO, constants.cliCommandsOptions.ONLYCOMPILER], executeOptions)
            assert.isOk(result.indexOf('compiler') >= 0, "Compiler is not running");
            assert.isOk(result.indexOf('node1') < 0, "Node is running");

            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP, constants.cliCommandsOptions.ONLYCOMPILER], executeOptions)
        })
        after(async () => {
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
            fs.removeSync(`.${ constants.nodeTestsFolderPath }`)
        })
    })

    xdescribe("AEproject Node -- allocated port's tests", () => {

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
            let result = await execute(constants.cliCommands.NODE, [], executeOptions)

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

    describe("AEproject node - handle if nodes of other project are running", () => {
        const nodeStorePath = path.resolve(process.cwd() + '/.aeproject-node-store/.node-store.json');
        let dockerConfig = '/docker-compose.yml';
        let compilerConfig = '/docker-compose.compiler.yml';
        let nodeStore;

        let secondNodeTestDir = process.cwd() + constants.nodeTestsFolderPathSecondProject;
        before(async () => {
            fs.ensureDirSync(`.${ constants.nodeTestsFolderPath }`)
            await execute(constants.cliCommands.INIT, [], executeOptions);
            fs.ensureDirSync(`.${ constants.nodeTestsFolderPathSecondProject }`)
            await execute(constants.cliCommands.INIT, [], { cwd: secondNodeTestDir })
        })
        it('Should correctly record where the node and compiler has been run from', async () => {
            await execute(constants.cliCommands.NODE, [], executeOptions)
            nodeStore = await fs.readJson(nodeStorePath)

            assert.isTrue((`${ path.resolve(executeOptions.cwd + dockerConfig) }` === path.resolve(nodeStore.node)), "node path has not been saved correcty");
            assert.isTrue((`${ path.resolve(executeOptions.cwd + compilerConfig) }` === path.resolve(nodeStore.compiler)), "compiler path has not been saved correcty");
        })

        it('Should correctly record absolute path where the node has been run from', async () => {
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.ONLY], executeOptions)
            nodeStore = await fs.readJson(nodeStorePath)

            assert.isTrue((path.resolve(nodeStore.node) === `${ path.resolve(executeOptions.cwd + dockerConfig) }`), "node path has not been saved correcty");
            assert.isTrue((!nodeStore.compiler), "compiler should be empty");
        })

        it('Should clear log file after node has been stopped', async () => {
            await execute(constants.cliCommands.NODE, [], executeOptions)
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP])

            nodeStore = await fs.readJson(nodeStorePath)

            assert.isTrue(nodeStore.node === '', "log file has not been cleared properly");
            assert.isTrue(nodeStore.compiler === '', "log file has not been cleared properly");
        })

        it('Should run AEproject node from one project directory and stop it from another', async () => {
            // init project from nodeTest directory
            await execute(constants.cliCommands.NODE, [], executeOptions)

            // try to stop the node from secondNodeTestDir
            let stopResult = await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], { cwd: secondNodeTestDir })
            let hasNodeStopped = stopResult.indexOf(`Node was successfully stopped`) >= 0;

            assert.isOk(hasNodeStopped)
        })
        it('Should run Aeproject node from current folder, if the folder it has previously been run, do not exist anymore', async () => {
            fs.ensureDirSync(path.resolve(secondNodeTestDir))

            process.chdir(secondNodeTestDir)
            await execute(constants.cliCommands.NODE, [], { cwd: secondNodeTestDir })

            fs.removeSync(process.cwd())

            await killRunningNodes()

            let startResult = await execute(constants.cliCommands.NODE, [], executeOptions)
            let hasNodeStarted = startResult.indexOf(`Node was successfully started`) >= 0;
            let nodeStore = await fs.readJSONSync(nodeStorePath)

            process.chdir(mainDir)

            assert.isOk(hasNodeStarted);
            assert.isTrue((path.resolve(nodeStore.node) === `${ path.resolve(nodeTestDir + dockerConfig) }`), "node path has not been updated correcty");
        })

        async function killRunningNodes () {
            let dirNameRgx = /[^/]+$/g;

            let pathDir = (process.cwd())
            let dirName = dirNameRgx.exec(pathDir)[0].toLowerCase()

            try {
                let res = await exec('docker', ['ps'])
                let container = getImageNames(res, dirName)

                await shutDownContainers(container)
            } catch (error) {
                console.log(error);
            }
        }

        async function shutDownContainers (container) {
            for (const image in container) {
                try {
                    await exec('docker', 'kill', [`${ container[image] }`])
                } catch (error) {
                    console.log(Buffer.from(error).toString('utf8'));
                }
            }
        }

        function getImageNames (res, imageStartsWith) {
            let imageRgxString = `\\b(\\w*${ imageStartsWith }\\w*)\\b`;
            let imageRgx = new RegExp(imageRgxString, "gim");

            let m
            let container = []

            do {
                m = imageRgx.exec(res);
                if (m) {
                    container.push(m[0])
                }
            } while (m);

            return container;
        }

        afterEach(async () => {
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
        })

        after(async () => {
            fs.removeSync(`.${ constants.nodeTestsFolderPath }`)
            fs.removeSync(`.${ constants.nodeTestsFolderPathSecondProject }`)
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