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
const utils = require('forgae-utils');
const execute = utils.execute;
const printError = utils.printError;
const print = utils.print;
const createMissingFolder = utils.createMissingFolder;
const copyFileOrDir = utils.copyFileOrDir;

const sdkVersion = constants.sdkVersion;

async function run (update) {
    if (update) {
        await updateForgaeProjectLibraries(sdkVersion);
        return;
    }

    try {
        await createForgaeProjectStructure();

    } catch (e) {
        printError(e.message)
        console.error(e);
    }
}

const createForgaeProjectStructure = async (shape) => {
    print('===== Initializing ForgAE =====');

    await installLibraries()

    print(`===== Creating project file & dir structure =====`);

    setupContracts(shape);
    setupTests(shape);
    setupIntegrations();
    await setupDeploy(shape);
    setupDocker();

    print('===== ForgAE was successfully initialized! =====');
}

const updateForgaeProjectLibraries = async (_sdkVersion) => {
    print(`===== Updating ForgAE files =====`);

    setupDocker();
    await installForgae()
    await installAeppSDK(_sdkVersion)
    await installYarn()

    print('===== ForgAE was successfully updated! =====');
}

async function prompt(error) {
    const args = [...arguments];
    // [0] - error
    // [1] - function to execute
    // [..] rest = function arguments 

    const funcToExecute = args[1];

    let inputData = '';

    // Get process.stdin as the standard input object.
    const input = process.stdin;

    // Set input character encoding.
    input.setEncoding('utf-8');

    // Prompt user to input data in console.
    console.log("'package.json' already exists, Do you want to overwrite it? (YES/no):");

    // When user input data and click enter key.
    input.on('data', function (data) {
        inputData += data.toString().trim();
    });

    const MAX_TIMEOUT = 10000;
    const INTERVAL_TIME = 400;
    let passedMs = 0;

    let inputInterval = setInterval(function () {

        if (inputData === 'YES') {
            console.log('===> 3.1');
            clearInterval(inputInterval);
            // copyFileOrDir(fileSource, "./package.json", { overwrite: true });

            !!!
            funcToExecute(...args.slice(2));
            console.log('===> 3.2');
        } // else {
        //     //inputData = '';
        // }

        passedMs += INTERVAL_TIME;

        if (passedMs >= MAX_TIMEOUT) {
            throw Error(error);
        }
    }, INTERVAL_TIME);
}

const installLibraries = async () => {
    console.log('====> 1');
    const fileSource = `${ __dirname }${ constants.artifactsDir }/package.json`;
    try {
        copyFileOrDir(fileSource, "./package.json")
    } catch (error) {
        if (error.message.includes('already exists')) {

            await prompt(error, copyFileOrDir, fileSource, "./package.json")

            await utils.timeout(10000);

        } else {
            throw Error(error);
        }
    }
    
    await installAeppSDK(sdkVersion)
    await installForgae()
    await installYarn()
}

const installAeppSDK = async (_sdkVersion = '') => {
    print('===== Installing aepp-sdk =====');
    await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', [`@aeternity/aepp-sdk@${ _sdkVersion }`, '--save-exact']);
}

const installForgae = async () => {
    print(`===== Installing ForgAE locally =====`);
    await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', [`forgae-lib`, '--save-exact', '--ignore-scripts', '--no-bin-links']);
}

const installYarn = async () => {
    print(`===== Installing yarn locally =====`);
    await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', ['yarn', '--save-exact', '--ignore-scripts', '--no-bin-links']);
}

const setupContracts = (shape) => {
    print(`===== Creating contracts directory =====`);
    const fileSource = shape ? `${ __dirname }${ constants.shapeArtifactsDir }/${ constants.shapeContractTemplateFile }` : `${ __dirname }${ constants.artifactsDir }/${ constants.contractTemplateFile }`;
    createMissingFolder(constants.contractsDir);
    copyFileOrDir(fileSource, shape ? constants.shapeContractFileDestination : constants.contractFileDestination)
}

const setupIntegrations = () => {
    print(`===== Creating integrations directory =====`);
    const fileSource = `${ __dirname }${ constants.artifactsDir }/${ constants.contratsAeppSetting }`;
    createMissingFolder(constants.integrationsDir);
    copyFileOrDir(fileSource, constants.contratsAeppSettingFileDestination)
}

const setupTests = (shape) => {
    print(`===== Creating tests directory =====`);
    const fileSource = shape ? `${ __dirname }${ constants.shapeArtifactsDir }/${ constants.shapeTestTemplateFile }` : `${ __dirname }${ constants.artifactsDir }/${ constants.testTemplateFile }`;
    createMissingFolder(constants.testDir, "Creating tests file structure");
    copyFileOrDir(fileSource, shape ? constants.shapeTestFileDestination : constants.testFileDestination)
}

const setupDeploy = async (shape) => {

    print(`===== Creating deploy directory =====`);
    const fileSource = shape ? `${ __dirname }${ constants.shapeArtifactsDir }/${ constants.shapeDeployTemplateFile }` : `${ __dirname }${ constants.artifactsDir }/${ constants.deployTemplateFile }`;
    createMissingFolder(constants.deployDir, "Creating deploy directory file structure");
    copyFileOrDir(fileSource, constants.deployFileDestination)
}

const setupDocker = () => {
    print(`===== Creating docker directory =====`);
    const dockerFilesSource = `${ __dirname }${ constants.artifactsDir }/${ constants.dockerTemplateDir }`;
    const copyOptions = {
        overwrite: true
    }

    const dockerYmlFileSource = `${ __dirname }${ constants.artifactsDir }/${ constants.dockerYmlFile }`;
    copyFileOrDir(dockerYmlFileSource, constants.dockerYmlFileDestination, copyOptions)
    copyFileOrDir(dockerFilesSource, constants.dockerFilesDestination, copyOptions)
}

module.exports = {
    run,
    createForgaeProjectStructure
}