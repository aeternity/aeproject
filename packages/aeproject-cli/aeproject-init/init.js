/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */
const constants = require('./constants.json');
const sdkVersion = constants.sdkVersion;

const utils = require('aeproject-utils');
const execute = utils.execute;
const printError = utils.printError;
const print = utils.print;
const createMissingFolder = utils.createMissingFolder;
const copyFileOrDir = utils.copyFileOrDir;
const writeFileRelative = utils.writeFileRelative;
const readFileRelative = utils.readFileRelative;

const prompts = require('prompts');

async function run (update) {
    if (update) {
        await updateAEprojectProjectLibraries(sdkVersion);
        return;
    }

    try {
        await createAEprojectProjectStructure();

    } catch (e) {
        printError(e.message);
        console.error(e);
    }
}

const createAEprojectProjectStructure = async (shape) => {
    print('===== Initializing AEproject =====');
    await installLibraries();

    print(`===== Creating project file & dir structure =====`);

    await setupContracts(shape);
    await setupTests(shape);
    await setupIntegrations();
    await setupDeploy(shape);
    await setupDocker();
    await addIgnoreFile();

    print('===== AEproject was successfully initialized! =====');
}

const updateAEprojectProjectLibraries = async (_sdkVersion) => {
    print(`===== Updating AEproject files =====`);

    await setupDocker();
    await installAEproject();
    await installAeppSDK(_sdkVersion);
    await installYarn();
    await uninstallForgaeDependencies();

    print('===== AEproject was successfully updated! =====');
}

const installLibraries = async () => {
    const fileSource = `${ __dirname }${ constants.artifactsDir }/package.json`;
    try {
        copyFileOrDir(fileSource, "./package.json");
    } catch (error) {
        if (error.message.includes('already exists')) {
            await prompt(error, copyFileOrDir, fileSource, "./package.json");
        } else {
            throw Error(error);
        }
    }

    await installAeppSDK(sdkVersion)
    await installAEproject()
    await installYarn()
}

const installAeppSDK = async (_sdkVersion = '') => {
    print('===== Installing aepp-sdk =====');
    await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', [`@aeternity/aepp-sdk@${ _sdkVersion }`, '--save-exact']);
}

const installAEproject = async () => {
    print(`===== Installing AEproject locally =====`);
    await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', [`aeproject-lib`, '--save-exact', '--ignore-scripts', '--no-bin-links']);
}

const installYarn = async () => {
    print(`===== Installing yarn locally =====`);
    await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', ['yarn', '--save-exact', '--ignore-scripts', '--no-bin-links']);
}

const uninstallForgaeDependencies = async () => {
    const localPackageJson = require(process.cwd() + `/package.json`);
    let forgaeRgx = /\s*"(forgae[^"]*)"\s*/gm;
    let forgaeDependencies = JSON.stringify(localPackageJson);
    let match;

    match = forgaeRgx.exec(forgaeDependencies);

    if (!match) {
        return
    }

    if (match[1] == 'forgae-project') {
        match = forgaeRgx.exec(forgaeDependencies)
    }

    if (!match) {
        return
    }

    print(`===== Removing ForgAE deprecated dependencies =====`);

    while (match) {
        await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'uninstall', [`${ match[1] }`]);
        match = forgaeRgx.exec(forgaeDependencies)
    }
}

const setupContracts = async (shape) => {

    print(`===== Creating contracts directory =====`);
    const fileSource = shape ? `${ __dirname }${ constants.shapeArtifactsDir }/${ constants.shapeContractTemplateFile }` : `${ __dirname }${ constants.artifactsDir }/${ constants.contractTemplateFile }`;
    createMissingFolder(constants.contractsDir);

    const destination = shape ? constants.shapeContractFileDestination : constants.contractFileDestination;

    try {
        copyFileOrDir(fileSource, destination);
    } catch (error) {
        if (error.message.includes('already exists')) {
            await prompt(error, copyFileOrDir, fileSource, destination);
        } else {
            throw Error(error);
        }
    }
}

const setupIntegrations = async () => {
    print(`===== Creating integrations directory =====`);
    const fileSource = `${ __dirname }${ constants.artifactsDir }/${ constants.contratsAeppSetting }`;
    createMissingFolder(constants.integrationsDir);

    try {
        copyFileOrDir(fileSource, constants.contratsAeppSettingFileDestination);
    } catch (error) {
        if (error.message.includes('already exists')) {
            await prompt(error, copyFileOrDir, fileSource, constants.contratsAeppSettingFileDestination);
        } else {
            throw Error(error);
        }
    }
}

const setupTests = async (shape) => {
    print(`===== Creating tests directory =====`);
    const fileSource = shape ? `${ __dirname }${ constants.shapeArtifactsDir }/${ constants.shapeTestTemplateFile }` : `${ __dirname }${ constants.artifactsDir }/${ constants.testTemplateFile }`;
    createMissingFolder(constants.testDir, "Creating tests file structure");

    try {
        copyFileOrDir(fileSource, shape ? constants.shapeTestFileDestination : constants.testFileDestination);
    } catch (error) {
        if (error.message.includes('already exists')) {
            await prompt(error, copyFileOrDir, fileSource, constants.testFileDestination);
        } else {
            throw Error(error);
        }
    }
}

const setupDeploy = async (shape) => {
    print(`===== Creating deploy directory =====`);
    const fileSource = shape ? `${ __dirname }${ constants.shapeArtifactsDir }/${ constants.shapeDeployTemplateFile }` : `${ __dirname }${ constants.artifactsDir }/${ constants.deployTemplateFile }`;
    createMissingFolder(constants.deployDir, "Creating deploy directory file structure");

    try {
        copyFileOrDir(fileSource, constants.deployFileDestination);
    } catch (error) {
        if (error.message.includes('already exists')) {
            await prompt(error, copyFileOrDir, fileSource, constants.deployFileDestination);
        } else {
            throw Error(error);
        }
    }
}

const setupDocker = async () => {
    print(`===== Creating docker directory =====`);
    const dockerFilesSource = `${ __dirname }${ constants.artifactsDir }/${ constants.dockerTemplateDir }`;
    const copyOptions = {
        overwrite: false
    }

    const dockerNodeYmlFileSource = `${ __dirname }${ constants.artifactsDir }/${ constants.dockerNodeYmlFile }`;

    try {
        copyFileOrDir(dockerNodeYmlFileSource, constants.dockerNodeYmlFileDestination);
    } catch (error) {
        if (error.message.includes('already exists')) {
            await prompt(error, copyFileOrDir, dockerNodeYmlFileSource, constants.dockerNodeYmlFileDestination);
        } else {
            throw Error(error);
        }
    }

    try {
        copyFileOrDir(dockerFilesSource, constants.dockerFilesDestination);
    } catch (error) {
        if (error.message.includes('already exists')) {
            await prompt(error, copyFileOrDir, dockerFilesSource, constants.dockerFilesDestination);
        } else {
            throw Error(error);
        }
    }

    const dockerCompilerYmlFileSource = `${ __dirname }${ constants.artifactsDir }/${ constants.dockerCompilerYmlFile }`;
    try {
        copyFileOrDir(dockerCompilerYmlFileSource, constants.dockerCompilerYmlFileDestination);
    } catch (error) {
        if (error.message.includes('already exists')) {
            await prompt(error, copyFileOrDir, dockerCompilerYmlFileSource, constants.dockerCompilerYmlFileDestination);
        } else {
            throw Error(error);
        }
    }
}

const addIgnoreFile = () => {
    print(`==== Adding additional files ====`)
    const ignoreFileContent = readFileRelative(`${ __dirname }${ constants.artifactsDir }/${ constants.gitIgnoreContent }`);
    writeFileRelative(constants.gitIgnoreFile, ignoreFileContent)
}

async function prompt (error) {
    const args = [...arguments];
    // [0] - error
    // [1] - function to execute
    // [..] rest = function arguments 

    const funcToExecute = args[1];

    // // Prompt user to input data in console.
    const response = await prompts({
        type: 'text',
        name: 'value',
        message: `${ error.message }\nDo you want to overwrite '${ error.message.replace(' already exists.', '') }'? (YES/no):`
        // validate: value => value < 18 ? `some validation text` : true
    });

    let input = response.value;
    if (input === 'YES' || input === 'yes' || input === 'Y' || input === 'y') {
        funcToExecute(...args.slice(2), {
            overwrite: true
        });
    } else {
        console.log(`'${ error.message.replace(' already exists.', '') }' will not be overwritten.`);
    }
}

module.exports = {
    run,
    createAEprojectProjectStructure
}