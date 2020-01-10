const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
const execute = require('../../packages/aeproject-utils/utils/aeproject-utils.js').aeprojectExecute;
const fs = require('fs-extra')
const constants = require('../constants.json')
const utilsPackageJson = require('../../packages/aeproject-utils/package.json')
const aeprojectLibVersion = require('../../packages/aeproject-lib/package.json').version;
const path = require('path');
const sdkVersion = require('./../../packages/aeproject-cli/aeproject-init/constants.json').sdkVersion;

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

function executeAndPassInput (cli, command, subcommand, inputParams = [], options = {}) {
    let result = '';

    return new Promise((resolve, reject) => {
        let timeout = 1000;
        var child = spawn(cli, [command, subcommand], options);
        
        child.stdout.on('data', (data) => {
            result += data;

            if (data.includes('AEproject was successfully updated') || data.includes('AEproject was successfully initialized')) {
                resolve(result)
            }
        });

        child.stderr.on('data', (data) => {
            console.log('err', data.toString('utf8'));
        });

        for (let param in inputParams) {
            setTimeout(() => {
                child.stdin.write(inputParams[param]);
            }, timeout);

            timeout += 2000;
        }
    });
}

function increaseSdkVersion (sdkVersion) {
    let tokens = sdkVersion.split('.');
    if (!isNaN(tokens[0])) {
        let nextMajorVersion = parseInt(tokens[0]) + 1;
        return nextMajorVersion + '.0.0';
    }

    return sdkVersion;
}

describe.only('AEproject Init', () => {
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

    it("Should update aeproject minor version successfully", async () => {
        await execute(constants.cliCommands.INIT, [], executeOptions);

        let projectPackageJson = require(executeOptions.cwd + constants.testsFiles.packageJson);
        projectPackageJson['dependencies']['aeproject-lib'] = "^2.0.0";

        fs.writeFileSync(executeOptions.cwd + constants.testsFiles.packageJson, JSON.stringify(projectPackageJson))
        await executeAndPassInput('aeproject', constants.cliCommands.INIT, constants.cliCommandsOptions.UPDATE, ['y\n', 'y\n', 'y\n'], executeOptions)

        delete require.cache[require.resolve(executeOptions.cwd + constants.testsFiles.packageJson)];
        let updatedProjectPackageJson = require(executeOptions.cwd + constants.testsFiles.packageJson);

        const aeprojectLibInProject = updatedProjectPackageJson.dependencies['aeproject-lib'];

        assert.isTrue(aeprojectLibInProject.includes(aeprojectLibVersion), "aeproject-lib is not updated properly");
    })

    it("Should NOT update aeproject to next major version", async () => {
        await execute(constants.cliCommands.INIT, [], executeOptions);

        let projectPackageJson = require(executeOptions.cwd + constants.testsFiles.packageJson);
        projectPackageJson['dependencies']['aeproject-lib'] = "^1.0.3";

        fs.writeFileSync(executeOptions.cwd + constants.testsFiles.packageJson, JSON.stringify(projectPackageJson))
        await executeAndPassInput('aeproject', constants.cliCommands.INIT, constants.cliCommandsOptions.UPDATE, ['y\n', 'y\n', 'y\n'], executeOptions)

        // we need to delete the allocated memory cache for this file, otherwise we could not fetch the updated data.
        delete require.cache[require.resolve(executeOptions.cwd + constants.testsFiles.packageJson)];
        let updatedProjectPackageJson = require(executeOptions.cwd + constants.testsFiles.packageJson);

        const aeprojectLibInProject = updatedProjectPackageJson.dependencies['aeproject-lib'];

        assert.isNotTrue(aeprojectLibInProject.includes(aeprojectLibVersion), "aeproject-lib is not updated properly");
    })

    it('Should update project successfully', async () => {
        await execute(constants.cliCommands.INIT, [], executeOptions)

        // Arrange
        const editedNodeContent = "edited node content"
        const editedCompilerContent = "edited compiler content"
        const editedDockerConfigContent = "edited content in docker config"
        const expectedUpdateOutput = "===== AEproject was successfully updated! =====";
        
        // Act
        fs.writeFileSync(executeOptions.cwd + constants.testsFiles.dockerComposeNodeYml, editedNodeContent)
        fs.writeFileSync(executeOptions.cwd + constants.testsFiles.dockerComposeCompilerYml, editedCompilerContent)
        fs.writeFileSync(executeOptions.cwd + constants.testsFiles.aeNodeOneConfig, editedDockerConfigContent)
        
        let result = await executeAndPassInput('aeproject', constants.cliCommands.INIT, constants.cliCommandsOptions.UPDATE, ['y\n', 'y\n', 'y\n'], executeOptions)
        
        assert.isTrue(result.includes(expectedUpdateOutput), 'project has not been updated successfully')

        // assert
        let editedDockerComposeNodeYml = fs.readFileSync(executeOptions.cwd + constants.testsFiles.dockerComposeNodeYml, 'utf8')
        let editedDockerComposeCompilerYml = fs.readFileSync(executeOptions.cwd + constants.testsFiles.dockerComposeCompilerYml, 'utf8')
        let editedDockerAeNodeYaml = fs.readFileSync(executeOptions.cwd + constants.testsFiles.aeNodeOneConfig, 'utf8')

        let projectPackageJson = require(executeOptions.cwd + constants.testsFiles.packageJson);
        const sdkVersion = utilsPackageJson.dependencies['@aeternity/aepp-sdk'];
        const sdkVersionInProject = projectPackageJson.dependencies['@aeternity/aepp-sdk'];

        assert.notEqual(editedDockerComposeNodeYml, editedNodeContent);
        assert.notEqual(editedDockerComposeCompilerYml, editedCompilerContent);
        assert.notEqual(editedDockerAeNodeYaml, editedDockerConfigContent);

        assert.equal(sdkVersion, sdkVersionInProject, "sdk version is not updated properly");

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

        let result = await executeAndPassInput('aeproject', constants.cliCommands.INIT, null, ['y\n'], executeOptions);

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

    // set higher version of sdk. check output of executeAndPass, if prompt text contains higher version , test should be OK
    it("Should keep user's sdk version", async () => {

        const highestSdkVersion = increaseSdkVersion(sdkVersion);

        await execute(constants.cliCommands.INIT, [], executeOptions);

        let packageJson = fs.readFileSync(path.join(executeOptions.cwd, './package.json'), 'utf8');
        packageJson = packageJson.replace(`"@aeternity/aepp-sdk": "${ sdkVersion }",`, `"@aeternity/aepp-sdk": "${ highestSdkVersion }",`)

        fs.writeFileSync(path.join(executeOptions.cwd, './package.json'), packageJson);

        let result = await executeAndPassInput('aeproject', constants.cliCommands.INIT, constants.cliCommandsOptions.UPDATE, ['y\n', 'y\n', 'y\n', 'y\n'], executeOptions)

        let isSdkPrompt = result.indexOf(`Found newer or different version of sdk ${ highestSdkVersion }. Keep it, instead of ${ sdkVersion }?`) >= 0;

        assert.isOk(isSdkPrompt, 'Missing prompt for keeping user version')
    })

    afterEach(async () => {
        fs.removeSync(`.${ constants.initTestsFolderPath }`);
    })
})