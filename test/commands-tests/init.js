const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
const execute = require('../../aeproject-utils/utils/aeproject-utils.js').aeprojectExecute;
const fs = require('fs-extra')
const constants = require('../constants.json')
const path = require('path');
const yaml = require('js-yaml');
const initConstants = require('./../../aeproject-cli/aeproject-init/constants.json');
const nodeVersion = initConstants.aeNodeImage;
const compilerVersion = initConstants.aeCompilerImage;
const sdkVersion = require('./../../aeproject-cli/aeproject-init/constants.json').sdkVersion;

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

function increaseVersion (version) {
    let tokens = version.replace('v', '').split('.');
    if (!isNaN(tokens[0])) {
        let nextMajorVersion = parseInt(tokens[0]) + 1;
        return nextMajorVersion + '.0.0';
    }

    return version;
}

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
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }/contracts/lib/ExampleLibrary.aes`), "example library doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.nodeModules }`), "node modules folder doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNode }`), "docker node doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }/docker/nginx.conf`), "docker nginx doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.gitIgnoreFile }`), "git ignore file doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }/config/network.json`), "network.json file doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }/config/wallets.json`), "wallets.json file doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }/utils/contract-utils.js`), "contract-utils.js file doesn't exist");
    });

    it('Should terminate init process and re-inited project successfully', async () => {
        let expectedResult = [
            `===== Installing aepp-sdk =====`,
            `===== Installing other dependencies =====`,
            `===== Creating project file & dir structure =====`,
            `===== Creating contracts & utils directory =====`,
            `===== Creating tests directory =====`,
            `===== Creating deploy directory =====`,
            `===== Creating docker directory =====`,
            `===== Creating config directory =====`,
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
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }/contracts/lib/ExampleLibrary.aes`), "example library doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.nodeModules }`), "node modules folder doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.dockerNode }`), "docker node doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }/docker/nginx.conf`), "docker nginx doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }${ constants.testsFiles.gitIgnoreFile }`), "git ignore file doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }/config/network.json`), "network.json file doesn't exist");
        assert.isTrue(fs.existsSync(`${ executeOptions.cwd }/config/wallets.json`), "wallets.json file doesn't exist");
    });

    xit("Should update docker-compose.yml and use user's node version", async () => {

        const nodeImage = 'aeternity/aeternity';
        const newerNodeVersion = `${ nodeImage }:v${ increaseVersion(nodeVersion.split(':')[1]) }`;

        await execute(constants.cliCommands.INIT, [], executeOptions);

        let nodeDockerComposePath = path.join(executeOptions.cwd, constants.testsFiles.dockerComposeNodeYml)

        // get and set newer version of ae node
        let doc = yaml.safeLoad(fs.readFileSync(nodeDockerComposePath, 'utf8'));
        for (let i in doc.services) {
            let image = doc.services[i].image;

            if (image.startsWith(nodeImage)) {
                doc.services[i].image = newerNodeVersion;
            }
        }

        let yamlStr = yaml.safeDump(doc);
        fs.writeFileSync(nodeDockerComposePath, yamlStr, 'utf8');

        await executeAndPassInput('aeproject', constants.cliCommands.INIT, constants.cliCommandsOptions.UPDATE, ['y\n', 'y\n', 'y\n', 'y\n'], executeOptions);

        doc = yaml.safeLoad(fs.readFileSync(nodeDockerComposePath, 'utf8'));
        for (let i in doc.services) {
            let image = doc.services[i].image;

            if (image.startsWith(nodeImage)) {
                assert.isOk(newerNodeVersion === image, "Mismatch of node's version");
            }
        }
    });

    xit("Should update docker-compose.compiler.yml and use user's compiler version ", async () => {
        const compilerImage = 'aeternity/aesophia_http';
        const newerCompilerVersion = `${ compilerImage }:v${ increaseVersion(compilerVersion.split(':')[1]) }`;

        await execute(constants.cliCommands.INIT, [], executeOptions);

        let compilerDockerComposePath = path.join(executeOptions.cwd, constants.testsFiles.dockerComposeCompilerYml)

        // get and set newer version of ae compiler
        let doc = yaml.safeLoad(fs.readFileSync(compilerDockerComposePath, 'utf8'));
        for (let i in doc.services) {
            let image = doc.services[i].image;

            if (image.startsWith(compilerImage)) {
                doc.services[i].image = newerCompilerVersion;
            }
        }

        let yamlStr = yaml.safeDump(doc);
        fs.writeFileSync(compilerDockerComposePath, yamlStr, 'utf8');

        await executeAndPassInput('aeproject', constants.cliCommands.INIT, constants.cliCommandsOptions.UPDATE, ['y\n', 'y\n', 'y\n', 'y\n'], executeOptions);

        doc = yaml.safeLoad(fs.readFileSync(compilerDockerComposePath, 'utf8'));
        for (let i in doc.services) {
            let image = doc.services[i].image;

            if (image.startsWith(compilerImage)) {
                assert.isOk(newerCompilerVersion === image, "Mismatch of compiler's version");
            }
        }
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