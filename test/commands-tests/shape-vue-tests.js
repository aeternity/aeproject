const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
const aeprojectExecute = require('../../packages/aeproject-utils/utils/aeproject-utils.js').aeprojectExecute;
const fs = require('fs-extra');
const path = require('path');

chai.use(chaiFiles);

const constants = require('../constants.json');
const cliCmds = constants.cliCommands;
const cliSubCmds = constants.cliSubCommands;

const testWorkingDir = constants.shapeVueTestsFolderPath;

let cwd = process.cwd();

describe('AEproject Shape Vue', async () => {

    let workingDir;

    before(async () => {
        workingDir = path.join(cwd, testWorkingDir);

        fs.ensureDirSync(workingDir);
        process.chdir(workingDir);
    });

    it('Should init shape vue project successfully', async () => {
        await aeprojectExecute(cliCmds.SHAPE, [cliSubCmds.VUE]);
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.packageJson)), "package.json doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.packageLockJson)), "package-lock.json doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.dockerComposeNodeYml)), "docker-compose.yml doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.dockerComposeCompilerYml)), "docker-compose.yml doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.toDoTestContractPath)), "test contract doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.deployScriptsPath)), "deploy scripts doesn't exists");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.contractsAeppSettings)), "contracts aepp settings file doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.nodeModules)), "node modules folder doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.dockerEntryPoint)), "docker entrypoint.sh doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.dockernodeNode1)), "docker node node1 doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.dockernodeNode2)), "docker node node2 doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.dockernodeNode3)), "docker node node3 doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.dockerHealthCheck)), "docker healtcheck.sh doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.dockerNginxCors)), "docker nginx-cors.conf doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.dockerNginxDefault)), "docker nginx-default doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.dockerNginxWs)), "docker nginx-ws doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.dockerKeys)), "docker keys folder doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.aeprojectStore)), "aeproject store folder doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.vueWebProjectPath)), "vue web project folder doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.toDoContract)), "ToDo Manager contract doesn't exist");
        assert.isTrue(fs.existsSync(path.join(workingDir, constants.testsFiles.gitIgnoreFile)), "Git ignore file doesnt' exist");
        
    });

    after(async () => {
        // delete test cwd
        fs.removeSync(workingDir);

        process.chdir(cwd);
    })
});