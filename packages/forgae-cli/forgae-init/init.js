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

const forgaeLibVersion = require('../../forgae-lib/package.json').version
const sdkVersion = require('../../forgae-utils/package.json').dependencies['@aeternity/aepp-sdk'];

async function run (update) {
    if (update) {
        await updateForgaeProjectLibraries(sdkVersion, forgaeLibVersion);
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

const updateForgaeProjectLibraries = async (_sdkVersion, _forgaeLibVersion) => {
    print(`===== Updating ForgAE files =====`);

    setupDocker();
    await installForgae(_forgaeLibVersion)
    await installAeppSDK(_sdkVersion)
    await installYarn()

    print('===== ForgAE was successfully updated! =====');
}

const installLibraries = async () => {
    const fileSource = `${ __dirname }${ constants.artifactsDir }/package.json`;
    copyFileOrDir(fileSource, "./package.json")
    await installAeppSDK(sdkVersion)
    await installForgae(forgaeLibVersion)
    await installYarn()
}

const installAeppSDK = async (_sdkVersion = '') => {
    print('===== Installing aepp-sdk =====');
    await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', [`@aeternity/aepp-sdk@${ _sdkVersion }`, '--save-exact']);
}

const installForgae = async (_forgaeLibVersion) => {
    print(`===== Installing ForgAE locally =====`);
    await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', [`forgae-lib@${ _forgaeLibVersion }`, '--save-exact', '--ignore-scripts', '--no-bin-links']);
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