const path = require('path');
const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
const execute = require('../../packages/aeproject-utils/utils/aeproject-utils.js').aeprojectExecute;
const exec = require('../../packages/aeproject-utils/utils/aeproject-utils.js').execute;
const winExec = require('../../packages/aeproject-utils/utils/aeproject-utils.js').winExec;
const isImageRunning = require('../utils').isImageRunning;
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

let mainDir = process.cwd();
let nodeTestDir = process.cwd() + constants.nodeTestsFolderPath;

let network = utils.config.localhostParams;
network.compilerUrl = utils.config.compilerUrl

const isWindowsPlatform = process.platform === 'win32';

const isImageRunningOpts = {
    dockerImage: nodeConfig.nodeConfiguration.dockerServiceNodeName,
    compilerImage: nodeConfig.compilerConfiguration.dockerServiceCompilerName,
    options: executeOptions
}

describe("AEproject Node and Compiler Tests", async () => {

    before(async () => {
        fs.ensureDirSync(`.${ constants.nodeTestsFolderPath }`)
        await execute(constants.cliCommands.INIT, [], executeOptions);
    })

    describe('AEproject Env', () => {
        before(async () => {
            await execute(constants.cliCommands.ENV, [], executeOptions);
        })

        it('Should start the node successfully', async () => {
            // We need to change directory where docker-compose config is located, so we can gather proper information for the node
            process.chdir(path.resolve(nodeTestDir))

            let running = await isImageRunning(isImageRunningOpts.dockerImage);

            assert.isTrue(running, "node wasn't started properly");

            process.chdir(mainDir)
        })

        it('Should check if the wallets are funded', async () => {

            let client = await utils.getClient(network);
            await waitUntilFundedBlocks(client, isImageRunningOpts)
            for (let wallet in defaultWallets) {
                let recipientBalance = await client.balance(defaultWallets[wallet].publicKey, balanceOptions)
                assert.isAbove(Number(recipientBalance), 0, `${ defaultWallets[wallet].publicKey } balance is not greater than 0`);
            }
        })

        it('Should check if the wallets are funded with the exact amount', async () => {
            let client = await utils.getClient(network);
            for (let wallet in defaultWallets) {
                let recipientBalanace = await client.balance(defaultWallets[wallet].publicKey, balanceOptions)
                assert.equal(recipientBalanace, nodeConfig.config.amountToFund, `${ defaultWallets[wallet].publicKey } balance is not greater than 0`);
            }
        })

        it('Process should have started local compiler', async () => {
            let result = await exec(constants.cliCommands.CURL, constants.getCompilerVersionURL);
            let isContainCurrentVersion = result.indexOf(`{"version"`) >= 0;

            assert.isOk(isContainCurrentVersion);
        })

        it('Should stop the node && compiler successfully', async () => {
            await execute(constants.cliCommands.ENV, [constants.cliCommandsOptions.STOP], executeOptions)

            let runningNode = await isImageRunning(isImageRunningOpts.dockerImage, executeOptions);
            let runningCompiler = await isImageRunning(isImageRunningOpts.compilerImage, executeOptions);

            assert.isNotTrue(runningNode, "node wasn't stopped properly");
            assert.isNotTrue(runningCompiler, "node wasn't stopped properly");
        })

        it('Process should stop when command is started in wrong folder.', async () => {
            let result = await execute(constants.cliCommands.ENV, [constants.cliCommandsOptions.START], {
                cwd: process.cwd()
            });

            if (!(result.indexOf('Process will be terminated!') >= 0 || result.indexOf('Process exited with code 1') >= 0)) {
                assert.isOk(false, "Process is still running in wrong folder.")
            }
        })

        after(async () => {
            await execute(constants.cliCommands.ENV, [constants.cliCommandsOptions.STOP], executeOptions)
        })
    })

    describe('AEproject Node', () => {
        let wrongFolder

        before(async () => {
            wrongFolder = process.cwd();
            process.chdir(nodeTestDir)
        })

        it('Process should stop when command is started in wrong folder.', async () => {

            let result = await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.START], {
                cwd: wrongFolder
            });

            if (!(result.indexOf('Process will be terminated!') >= 0 || result.indexOf('Process exited with code 1') >= 0)) {
                assert.isOk(false, "Process is still running in wrong folder.")
            }
        })

        it('Process should NOT start local compiler', async () => {
            await execute(constants.cliCommands.NODE, [], executeOptions)

            let result = await exec(constants.cliCommands.CURL, constants.getCompilerVersionURL);

            assert.isOk(result.indexOf('Connection refused') >= 0, "There is a port that listening on compiler's port.");
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
        })

        it('Process should start local nodes only', async () => {
            await execute(constants.cliCommands.NODE, [], executeOptions)

            let dockerRunning = await isImageRunning(isImageRunningOpts.dockerImage);
            let compilerRunning = await isImageRunning(isImageRunningOpts.compilerImage);

            assert.isTrue(dockerRunning, 'node were not started successfully')
            assert.isNotTrue(compilerRunning, "compiler should not be running");

            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
        })

        it('Process should start local node while the compiler image is already running', async () => {
            await execute(constants.cliCommands.COMPILER, [], executeOptions)

            let dockerRunning = await isImageRunning(isImageRunningOpts.dockerImage);
            let compilerRunning = await isImageRunning(isImageRunningOpts.compilerImage);

            assert.isTrue(compilerRunning, 'compiler was not started successfully')
            assert.isFalse(dockerRunning, 'docker is running')

            await execute(constants.cliCommands.NODE, [], executeOptions)

            dockerRunning = await isImageRunning(isImageRunningOpts.dockerImage);

            assert.isTrue(dockerRunning, 'node was not started successfully')
            await execute(constants.cliCommands.ENV, [constants.cliCommandsOptions.STOP], executeOptions)
        })

        it('Process should stop only the nodes', async () => {
            await execute(constants.cliCommands.ENV, [], executeOptions)
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP])

            let dockerRunning = await isImageRunning(isImageRunningOpts.dockerImage);
            let compilerRunning = await isImageRunning(isImageRunningOpts.compilerImage);

            assert.isNotTrue(dockerRunning, 'node was not stopped successfully')
            assert.isTrue(compilerRunning, 'compiler was stopped incorrectly')

            await execute(constants.cliCommands.COMPILER, [constants.cliCommandsOptions.STOP], executeOptions)
        })

        after(async () => {
            process.chdir(mainDir)
        })
    })

    describe('AEproject Compiler', () => {

        before(async () => {
            process.chdir(nodeTestDir)
        })

        it('Process should start local compiler only', async () => {
            await execute(constants.cliCommands.COMPILER, [], executeOptions)

            let compilerRunning = await isImageRunning(isImageRunningOpts.compilerImage);
            let dockerRunning = await isImageRunning(isImageRunningOpts.dockerImage);

            assert.isTrue(compilerRunning, 'compiler was not started')
            assert.isNotTrue(dockerRunning, "node should not be running");

            await execute(constants.cliCommands.COMPILER, [constants.cliCommandsOptions.STOP], executeOptions)
        })

        it('Process should NOT start local nodes', async () => {
            await execute(constants.cliCommands.COMPILER, [], executeOptions)

            let result = await exec(constants.cliCommands.CURL, constants.getNodeVersionURL);

            assert.isOk(result.indexOf('Connection refused') >= 0, "There is a port that listening on compiler's port.");
            await execute(constants.cliCommands.COMPILER, [constants.cliCommandsOptions.STOP], executeOptions)
        })

        it('Process should start local compiler while the node images are already running', async () => {
            await execute(constants.cliCommands.NODE, [], executeOptions)

            let dockerRunning = await isImageRunning(isImageRunningOpts.dockerImage);
            let compilerRunning = await isImageRunning(isImageRunningOpts.compilerImage);

            assert.isTrue(dockerRunning, 'node was not started successfully')
            assert.isFalse(compilerRunning, 'compiler is running')

            await execute(constants.cliCommands.COMPILER, [], executeOptions)
            compilerRunning = await isImageRunning(isImageRunningOpts.compilerImage);

            assert.isTrue(compilerRunning, 'compiler was not started successfully')

            await execute(constants.cliCommands.ENV, [constants.cliCommandsOptions.STOP], executeOptions)
        })

        it('Process should stop only the compiler', async () => {
            await execute(constants.cliCommands.ENV, [], executeOptions)
            await execute(constants.cliCommands.COMPILER, [constants.cliCommandsOptions.STOP])

            let dockerRunning = await isImageRunning(isImageRunningOpts.dockerImage);
            let compilerRunning = await isImageRunning(isImageRunningOpts.compilerImage);

            assert.isNotTrue(compilerRunning, 'compiler was not stopped successfully')
            assert.isTrue(dockerRunning, 'node was stopped incorrectly')

            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
        })

        after(async () => {
            process.chdir(mainDir)
        })
    })

    describe('Aeproject Env/Node/Compiler  --info', () => {

        it('Should display info that node is not running', async () => {
            let result = await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.INFO], executeOptions)
            assert.isOk(result.indexOf('Node is not running') >= 0, "Nodes are running");
        })

        it('Should display info that compiler is not running', async () => {
            let result = await execute(constants.cliCommands.COMPILER, [constants.cliCommandsOptions.INFO], executeOptions)
            assert.isOk(result.indexOf('Compiler is not running') >= 0, "Compiler is running");
        })

        it('Should display info that either nodes or compiler is not running', async () => {
            let result = await execute(constants.cliCommands.ENV, [constants.cliCommandsOptions.INFO], executeOptions)
            assert.isOk(result.indexOf('Compiler or Node is not running!') >= 0, "Nodes or compiler are running");
        })

        it('Should display info for running nodes and compiler instances', async () => {
            await execute(constants.cliCommands.ENV, [], executeOptions)

            let result = await execute(constants.cliCommands.ENV, [constants.cliCommandsOptions.INFO], executeOptions)

            assert.isOk(result.indexOf('node1') >= 0, "Node is not running");
            assert.isOk(result.indexOf('compiler') >= 0, "Compiler is not running");

            await execute(constants.cliCommands.ENV, [constants.cliCommandsOptions.STOP], executeOptions)
        })

        it('Should display info for compiler only', async () => {
            await execute(constants.cliCommands.COMPILER, [], executeOptions)

            let result = await execute(constants.cliCommands.COMPILER, [constants.cliCommandsOptions.INFO], executeOptions)
            assert.isOk(result.indexOf('compiler') >= 0, "Compiler is not running");
            assert.isOk(result.indexOf('node1') < 0, "Node is running");

            await execute(constants.cliCommands.COMPILER, [constants.cliCommandsOptions.STOP], executeOptions)
        })

        it('Should display info for nodes only', async () => {
            await execute(constants.cliCommands.NODE, [], executeOptions)

            let result = await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.INFO], executeOptions)
            assert.isOk(result.indexOf('node1') >= 0, "Node is not running");
            assert.isOk(result.indexOf('compiler') < 0, "Compiler is running");

            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
        })
    })

    describe("AEproject Node -- allocated port's tests", () => {

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
            let result = await execute(constants.cliCommands.ENV, [], executeOptions)

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
            let result = await execute(constants.cliCommands.ENV, [], executeOptions);

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
            let result = await execute(constants.cliCommands.ENV, [
                constants.cliCommandsOptions.COMPILER_PORT,
                port
            ], executeOptions);

            const isSuccessfullyStarted = result.indexOf(`Local Compiler was successfully started on port:${ port }`) >= 0;

            assert.isOk(isSuccessfullyStarted, 'Local compiler does not start on specific port!');
        });

        after(async () => {

            let running = await isImageRunning(isImageRunningOpts.dockerImage, executeOptions);
            if (running) {
                await execute(constants.cliCommands.ENV, [constants.cliCommandsOptions.STOP], executeOptions)
            }
        })
    })

    describe("AEproject node - handle if nodes of other project are running", () => {
        const nodeStorePath = path.resolve(process.cwd() + (constants.nodeStoreFolder + '/.node-store.json'));
        let dockerConfig = '/docker-compose.yml';
        let compilerConfig = '/docker-compose.compiler.yml';
        let nodeStore;

        let secondNodeTestDir = process.cwd() + constants.nodeTestsFolderPathSecondProject;

        before(async () => {
            fs.ensureDirSync(`.${ constants.nodeTestsFolderPathSecondProject }`)
            await execute(constants.cliCommands.INIT, [], {
                cwd: secondNodeTestDir
            })
        })

        it('Should correctly record where the node and compiler has been run from', async () => {
            await execute(constants.cliCommands.ENV, [], executeOptions)
            nodeStore = await fs.readJson(nodeStorePath)

            assert.isTrue((`${ path.resolve(executeOptions.cwd + dockerConfig) }` === path.resolve(nodeStore.node)), "node path has not been saved correcty");
            assert.isTrue((`${ path.resolve(executeOptions.cwd + compilerConfig) }` === path.resolve(nodeStore.compiler)), "compiler path has not been saved correcty");

            await execute(constants.cliCommands.ENV, [constants.cliCommandsOptions.STOP], executeOptions)
        })

        it('Should correctly record absolute path where the node has been run from', async () => {
            await execute(constants.cliCommands.NODE, [], executeOptions)
            nodeStore = await fs.readJson(nodeStorePath)

            assert.isTrue((path.resolve(nodeStore.node) === `${ path.resolve(executeOptions.cwd + dockerConfig) }`), "node path has not been saved correcty");
            assert.isTrue((!nodeStore.compiler), "compiler should be empty");

            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
        })

        it('Should clear log file after node has been stopped', async () => {
            await execute(constants.cliCommands.ENV, [], executeOptions)
            await execute(constants.cliCommands.ENV, [constants.cliCommandsOptions.STOP])

            nodeStore = await fs.readJson(nodeStorePath)

            assert.isTrue(nodeStore.node === '', "log file has not been cleared properly");
            assert.isTrue(nodeStore.compiler === '', "log file has not been cleared properly");
        })

        it('Should run AEproject ENV from one project directory and stop it from another', async () => {
            // init project from nodeTest directory
            await execute(constants.cliCommands.ENV, [], executeOptions)

            // try to stop the node from secondNodeTestDir
            let stopResult = await execute(constants.cliCommands.ENV, [constants.cliCommandsOptions.STOP], {
                cwd: secondNodeTestDir
            })
            let hasNodeStopped = stopResult.indexOf(`Node was successfully stopped`) >= 0;

            assert.isOk(hasNodeStopped)

            await execute(constants.cliCommands.ENV, [constants.cliCommandsOptions.STOP])
        })

        it('Should run Aeproject env from current folder, if the folder it has previously been run, do not exist anymore', async () => {
            fs.ensureDirSync(path.resolve(secondNodeTestDir))

            process.chdir(secondNodeTestDir)
            await execute(constants.cliCommands.ENV, [], {
                cwd: secondNodeTestDir
            })

            fs.removeSync(process.cwd())

            await killRunningNodes()

            let startResult = await execute(constants.cliCommands.ENV, [], executeOptions)
            let hasNodeStarted = startResult.indexOf(`Node was successfully started`) >= 0;
            let nodeStore = await fs.readJSONSync(nodeStorePath)

            process.chdir(mainDir)

            assert.isOk(hasNodeStarted);
            assert.isTrue((path.resolve(nodeStore.node) === `${ path.resolve(nodeTestDir + dockerConfig) }`), "node path has not been updated correcty");

            await execute(constants.cliCommands.ENV, [constants.cliCommandsOptions.STOP])
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
                await winExec(cliCommand, constants.cliCommands.ENV, ['--windows'], executeOptions);
            })

            it('Should start the node successfully', async () => {
                let running = await isImageRunning(dockerServiceNodeName, executeOptions);
                assert.isTrue(running, "node wasn't started properly");
            })

            it('Should check if the wallets are funded', async () => {

                let client = await utils.getClient(network);
                await waitUntilFundedBlocks(client, {
                    blocks: 8,
                    dockerImage: dockerServiceNodeName,
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

            it('Process should start local compiler', async () => {
                let result = await exec(constants.cliCommands.CURL, constants.getCompilerVersionURL.replace('localhost', nodeConfig.nodeConfiguration.dockerMachineIP));
                let isContainCurrentVersion = result.indexOf(`{"version"`) >= 0;

                assert.isOk(isContainCurrentVersion);
            })

            it('Should stop the node successfully', async () => {
                await winExec(cliCommand, constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
                let running = await isImageRunning(isImageRunningOpts.dockerImage, executeOptions);
                assert.isNotTrue(running, "node wasn't stopped properly");
            })

            it('Should stop the compiler successfully', async () => {
                await winExec(cliCommand, constants.cliCommands.COMPILER, [constants.cliCommandsOptions.STOP], executeOptions)
                let running = await isImageRunning(isImageRunningOpts.compilerImage, executeOptions);
                assert.isNotTrue(running, "compiler wasn't stopped properly");
            })

            it('Should stop the node and compiler successfully', async () => {
                await winExec(cliCommand, constants.cliCommands.ENV, ['--windows'], executeOptions);
                await winExec(cliCommand, constants.cliCommands.ENV, [constants.cliCommandsOptions.STOP], executeOptions)
                
                let dockerRunning = await isImageRunning(isImageRunningOpts.dockerImage);
                let compilerRunning = await isImageRunning(isImageRunningOpts.compilerImage);
                
                assert.isNotTrue(dockerRunning, "node wasn't stopped properly");
                assert.isNotTrue(compilerRunning, "compiler wasn't stopped properly");
            })

            it('Process should stop when command is started in wrong folder.', async () => {
                let result = await winExec(cliCommand, constants.cliCommands.ENV, ['--windows'], {
                    cwd: process.cwd()
                });

                if (!(result.includes('Process will be terminated!') || result.includes('Process exited with code 1'))) {
                    assert.isOk(false, "Process is still running in wrong folder.")
                }
            })

            after(async () => {

                let running = await isImageRunning(dockerServiceNodeName, executeOptions);
                if (running) {
                    await winExec(cliCommand, constants.cliCommands.ENV, [constants.cliCommandsOptions.STOP], executeOptions)
                }
            })
        })
    }

    after(async () => {
        fs.removeSync(`.${ constants.nodeTestsFolderPath }`)
    })
})