const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
const execute = require('../../packages/aeproject-utils/utils/aeproject-utils.js').aeprojectExecute;
const fs = require('fs-extra')
const constants = require('../constants.json')
const utilsPackageJson = require('../../packages/aeproject-utils/package.json')
const aeprojectLibVersion = require('../../packages/aeproject-lib/package.json').version;
const path = require('path')

let executeOptions = {
    cwd: process.cwd() + constants.initTestsFolderPath
};

chai.use(chaiFiles);

const {
    spawn
} = require('promisify-child-process');

const executeAndKill = async (cli, command, args = [], options = {}) => {
    try {
        const child = spawn(cli, [command, ...args], options);

        setTimeout(function () {
            process.kill(child.pid)
        }, 4000)

        await child

        let result = child.stdout.toString('utf8');
        result += child.stderr.toString('utf8');
        return result;
    } catch (e) {
        let result = e.stdout ? e.stdout.toString('utf8') : e.message;
        result += e.stderr ? e.stderr.toString('utf8') : e.message;

        return result;
    }
};

const executeAndPassInput = async (cli, command, args = [], options = {}) => {
    try {
        const child = spawn(cli, [command, ...args], options);

        // pass needed input to 'terminal'
        child.stdin.write('y\n');

        child.stdout.on('data', function (data) {
            // console.log('stdout: ' + data);
        });
        child.stdin.end();

        let awaitedProcess = await child;
        let result = awaitedProcess.stdout.toString('utf8');
        result += awaitedProcess.stderr.toString('utf8');

        return result;
    } catch (e) {
        console.log(e)

        let result = e.stdout ? e.stdout.toString('utf8') : e.message;
        result += e.stderr ? e.stderr.toString('utf8') : e.message;

        return result;
    }
};

describe('AEproject Init', () => {
    beforeEach(async () => {
        fs.ensureDirSync(`.${ constants.initTestsFolderPath }`)
    });

    it('Should init project successfully', async () => {
   
        await execute(constants.cliCommands.INIT, [], executeOptions)

        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.packageJson }`), "package.json doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.packageLockJson }`), "package-lock.json doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerComposeNodeYml }`), "docker-compose.yml doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerComposeCompilerYml }`), "docker-compose.compiler.yml doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.testContractPath }`), "test contract doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.deployScriptsPath }`), "deploy scripts doesn't exists");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.contractsPath }`), "example contract doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.contractsAeppSettings }`), "contracts aepp settings file doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.nodeModules }`), "node modules folder doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerEntryPoint }`), "docker entrypoint.sh doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode1 }`), "docker node node1 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode2 }`), "docker node node2 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode3 }`), "docker node node3 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerHealthCheck }`), "docker healtcheck.sh doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxCors }`), "docker nginx-cors.conf doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxDefault }`), "docker nginx-default doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxWs }`), "docker nginx-ws doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerKeys }`), "docker keys folder doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.gitIgnoreFile }`), "git ignore file doesn't exist");
    });

    it('Should update project successfully', async () => {

        // Arrange
        const editedContent = "edited content"
        await execute(constants.cliCommands.INIT, [], executeOptions)

        // Act
        fs.writeFile(executeOptions.cwd + constants.testsFiles.dockerComposeNodeYml, editedContent)

        let result = await executeAndPassInput('aeproject', constants.cliCommands.INIT, ["--update"], executeOptions)
        console.log(result);
        // await execute(constants.cliCommands.INIT, ["--update"], executeOptions)

        // //assert
        let editedDockerComposeYml = fs.readFileSync(executeOptions.cwd + constants.testsFiles.dockerComposeNodeYml, 'utf8')

        const sdkVersion = utilsPackageJson.dependencies['@aeternity/aepp-sdk'];
        const projectPackageJson = require("./initTests/package.json");

        const sdkVersionInProject = projectPackageJson.dependencies['@aeternity/aepp-sdk'];
        const aeprojectLibInProject = projectPackageJson.dependencies['aeproject-lib'];

        assert.notEqual(editedDockerComposeYml, editedContent);
        assert.equal(sdkVersion, sdkVersionInProject, "sdk version is not updated properly");
        assert.equal(aeprojectLibVersion, aeprojectLibInProject, "aeproject-lib is not updated properly");

        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.packageJson }`), "package.json doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.packageLockJson }`), "package-lock.json doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerComposeNodeYml }`), "docker-compose.yml doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerComposeCompilerYml }`), "docker-compose.compiler.yml doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.testContractPath }`), "test contract doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.deployScriptsPath }`), "deploy scripts doesn't exists");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.contractsPath }`), "example contract doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.nodeModules }`), "node modules folder doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerEntryPoint }`), "docker entrypoint.sh doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode1 }`), "docker node node1 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode2 }`), "docker node node2 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode3 }`), "docker node node3 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerHealthCheck }`), "docker healtcheck.sh doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxCors }`), "docker nginx-cors.conf doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxDefault }`), "docker nginx-default doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxWs }`), "docker nginx-ws doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerKeys }`), "docker keys folder doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.gitIgnoreFile }`), "git ignore file doesn't exist");
    });

    it('Should terminate init process and re-inited project successfully', async () => {

        let expectedResult = [
            `===== Installing aepp-sdk =====`,
            `===== Installing AEproject locally =====`,
            `===== Installing yarn locally =====`,
            `===== Creating project file & dir structure =====`,
            `===== Creating contracts directory =====`,
            `===== Creating tests directory =====`,
            `===== Creating integrations directory =====`,
            `===== Creating deploy directory =====`,
            `===== Creating docker directory =====`,
            `==== Adding additional files ====`,
            `===== AEproject was successfully initialized! =====`
        ];

        await executeAndKill('aeproject', constants.cliCommands.INIT, [], executeOptions)

        let result = await executeAndPassInput('aeproject', constants.cliCommands.INIT, [], executeOptions);

        assert.isOk(result.trim().includes(`Do you want to overwrite './package.json'? (YES/no):\u001b[22m \u001b[90m…\u001b[39m y\u001b7\u001b8`), `'Init' command do not produce expected result (prompt for user action)`);

        for (let line of expectedResult) {
            assert.isOk(result.trim().includes(line.trim()), `There is missing initialization action.`);
        }

        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.packageJson }`), "package.json doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.packageLockJson }`), "package-lock.json doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerComposeNodeYml }`), "docker-compose.yml doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerComposeCompilerYml }`), "docker-compose.compiler.yml doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.testContractPath }`), "test contract doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.deployScriptsPath }`), "deploy scripts doesn't exists");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.contractsPath }`), "example contract doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.contractsAeppSettings }`), "contracts aepp settings file doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.nodeModules }`), "node modules folder doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerEntryPoint }`), "docker entrypoint.sh doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode1 }`), "docker node node1 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode2 }`), "docker node node2 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockernodeNode3 }`), "docker node node3 doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerHealthCheck }`), "docker healtcheck.sh doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxCors }`), "docker nginx-cors.conf doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxDefault }`), "docker nginx-default doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNginxWs }`), "docker nginx-ws doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerKeys }`), "docker keys folder doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.gitIgnoreFile }`), "git ignore file doesn't exist");
    });

    afterEach(async () => {
        fs.removeSync(`.${constants.initTestsFolderPath}`);
    })
})