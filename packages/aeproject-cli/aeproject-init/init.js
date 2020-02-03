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
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

async function run (update) {
    if (update) {
        await updateAEprojectProjectLibraries(sdkVersion, update);
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

const compareSdkVersions = async (_sdkVersion, cwd) => {
    // get current sdk version
    let userPackageJson = JSON.parse(fs.readFileSync(path.join(cwd, './package.json'), 'utf8'));
    let userSdkVersion = userPackageJson.dependencies['@aeternity/aepp-sdk'];

    if (userSdkVersion) {
        let userVersioning = userSdkVersion.split('.');
        let updateToVersioning = _sdkVersion.split('.');

        let promptMessage = `Found newer or different version of sdk ${ userSdkVersion }. Keep it, instead of ${ _sdkVersion }?`;

        for (let i = 0; i < 3; i++) {
            let user = userVersioning[i];
            let updateTo = updateToVersioning[i];

            if (!isNaN(user)) {
                if (parseInt(user) > parseInt(updateTo)) {
                    if (await promptUpdate(promptMessage)) {
                        _sdkVersion = userSdkVersion;
                        break;
                    }
                }
            } else {
                if (await promptUpdate(promptMessage)) {
                    _sdkVersion = userSdkVersion;
                    break;
                }
            }
        }
    }

    return _sdkVersion;
}

const updateAEprojectProjectLibraries = async (_sdkVersion, update) => {
    print(`===== Updating AEproject files =====`);
    
    _sdkVersion = await compareSdkVersions(_sdkVersion, process.cwd());

    await setupDocker(true);
    await installAEproject(update);
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
}

const installAeppSDK = async (_sdkVersion = '') => {
    print('===== Installing aepp-sdk =====');
    await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', [`@aeternity/aepp-sdk@${ _sdkVersion }`, '--save-exact']);
}

const installAEproject = async (isUpdate) => {

    if (isUpdate) {
        utils.addCaretToDependencyVersion("aeproject-lib");
    }

    print(`===== Installing AEproject locally =====`);
    await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', [`aeproject-lib`, '--ignore-scripts', '--no-bin-links']);
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

const setDockerImageVersion = (pathToDockerYmlFile, dockerImage) => {
    let doc = yaml.safeLoad(fs.readFileSync(pathToDockerYmlFile, 'utf8'));

    let tokens = dockerImage.split(':');
    let imageLiteral = tokens[0];

    for (let i in doc.services) {
        let image = doc.services[i].image;

        if (image.startsWith(imageLiteral)) {
            doc.services[i].image = dockerImage;
        }
    }

    let yamlStr = yaml.safeDump(doc);
    fs.writeFileSync(pathToDockerYmlFile, yamlStr, 'utf8');
}

const setupDocker = async (isUpdate) => {
    print(`===== Creating docker directory =====`);
    
    const dockerFilesSource = `${ __dirname }${ constants.artifactsDir }/${ constants.dockerTemplateDir }`;
    const dockerNodeYmlFileSource = `${ __dirname }${ constants.artifactsDir }/${ constants.dockerNodeYmlFile }`;
    const dockerCompilerYmlFileSource = `${ __dirname }${ constants.artifactsDir }/${ constants.dockerCompilerYmlFile }`;

    const nodeTokens = constants.aeNodeImage.split(':');
    const compilerTokens = constants.aeCompilerImage.split(':');

    let nodeVersion = [];
    let compilerVersion = [];
    
    if (isUpdate) {

        const aeternityNodeImageLiteral = nodeTokens[0];
        const aeternityCompilerImageLiteral = compilerTokens[0];

        try {
            // read user's node yml
            let userNodeYmlPath = path.join(process.cwd(), constants.dockerNodeYmlFile);
            let doc = yaml.safeLoad(fs.readFileSync(userNodeYmlPath, 'utf8'));

            for (let i in doc.services) {
                let image = doc.services[i].image;

                if (image.startsWith(aeternityNodeImageLiteral)) {
                    let imageTokens = image.split(':')
                    let currentVersion = imageTokens[1];

                    nodeVersion.push(currentVersion);  
                }
            }

        } catch (e) {
            console.log(e);
        }

        try {
            // read user's compiler yml
            let userCompilerYmlPath = path.join(process.cwd(), constants.dockerCompilerYmlFile);
            let doc = yaml.safeLoad(fs.readFileSync(userCompilerYmlPath, 'utf8'));

            for (let i in doc.services) {
                let image = doc.services[i].image;

                if (image.startsWith(aeternityCompilerImageLiteral)) {
                    let imageTokens = image.split(':')
                    let currentVersion = imageTokens[1];

                    compilerVersion.push(currentVersion);
                }
            }
        } catch (e) {
            console.log(e);
        }
    } else {
        nodeVersion.push(nodeTokens[1]);
        compilerVersion.push(compilerTokens[1]);
    }

    // set latest version
    const aeternityNodeImageLiteral = nodeTokens[0];
    const aeternityCompilerImageLiteral = compilerTokens[0];

    const defaultNodeVersion = nodeTokens[1];
    const defaultCompilerVersion = compilerTokens[1];

    const promptNodeMessage = `Default node version is ${ defaultNodeVersion }, found ${ nodeVersion[0] }. Do you want to keep current .yml file with node version: ${ nodeVersion[0] } instead of default one with ${ defaultNodeVersion }?`;
    let nodeResult = await compareVersion(nodeVersion[0], defaultNodeVersion, promptNodeMessage);

    const promptCompilerMessage = `Default compiler version is ${ defaultCompilerVersion }, found ${ compilerVersion[0] }. Do you want to keep current .yml file with compiler version: ${ compilerVersion[0] } instead of default one with ${ defaultCompilerVersion }?`;
    let compilerResult = await compareVersion(compilerVersion[0], defaultCompilerVersion, promptCompilerMessage);

    if (nodeResult.version !== defaultNodeVersion) {
        setDockerImageVersion(dockerNodeYmlFileSource, `${ aeternityNodeImageLiteral }:${ nodeResult.version }`);
    }

    if (compilerResult.version !== defaultCompilerVersion) {
        setDockerImageVersion(dockerCompilerYmlFileSource, `${ aeternityCompilerImageLiteral }:${ compilerResult.version }`);
    }

    // PS: update user's files only if it choose default version
    // docker-compose.yml - node config
    if (nodeResult.version === defaultNodeVersion) {
        try {
            copyFileOrDir(dockerNodeYmlFileSource, constants.dockerNodeYmlFileDestination, { overwrite: nodeResult.isUserVersionGreater });
        } catch (error) {
            if (error.message.includes('already exists')) {
                await prompt(error, copyFileOrDir, dockerNodeYmlFileSource, constants.dockerNodeYmlFileDestination);
            } else {
                throw Error(error);
            }
        }
    }

    if (compilerResult.version === defaultCompilerVersion) {
        try {
            copyFileOrDir(dockerCompilerYmlFileSource, constants.dockerCompilerYmlFileDestination, { overwrite: compilerResult.isUserVersionGreater });
        } catch (error) {
            if (error.message.includes('already exists')) {
                await prompt(error, copyFileOrDir, dockerCompilerYmlFileSource, constants.dockerCompilerYmlFileDestination);
            } else {
                throw Error(error);
            }
        }
    }

    // ./docker files
    try {
        copyFileOrDir(dockerFilesSource, constants.dockerFilesDestination);
    } catch (error) {
        if (error.message.includes('already exists')) {
            await prompt(error, copyFileOrDir, dockerFilesSource, constants.dockerFilesDestination);
        } else {
            throw Error(error);
        }
    }

    // set default image version if there are changes
    if (nodeResult.version !== defaultNodeVersion) {
        setDockerImageVersion(dockerNodeYmlFileSource, `${ aeternityNodeImageLiteral }:${ defaultNodeVersion }`);
    }

    if (compilerResult.version !== defaultCompilerVersion) {
        setDockerImageVersion(dockerCompilerYmlFileSource, `${ aeternityCompilerImageLiteral }:${ defaultCompilerVersion }`);
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

        return true;
    } 
    
    console.log(`'${ error.message.replace(' already exists.', '') }' will not be overwritten.`);
    return false;
}

async function promptUpdate (message) {

    // // Prompt user to input data in console.
    const response = await prompts({
        type: 'text',
        name: 'value',
        message: `${ message } (Y/n):`
        // validate: value => value < 18 ? `some validation text` : true
    });

    let input = response.value;
    if (input === 'YES' || input === 'yes' || input === 'Y' || input === 'y') {
        return true;
    } 

    return false;
}

const compareVersion = async (currentVersion, defaultVersion, promptMessage) => {

    let result = {
        version: defaultVersion,
        isUserVersionGreater: false
    }

    if (!currentVersion) {
        return result;
    }

    let currentVersionTokens = currentVersion.replace('v', '').split('.');
    let defaultVersionTokens = defaultVersion.replace('v', '').split('.');

    for (let i = 0; i < 3; i++) {
        let user = currentVersionTokens[i];
        let updateTo = defaultVersionTokens[i];

        if (!isNaN(updateTo) && !isNaN(user)) {
            if (parseInt(user) > parseInt(updateTo)) {
                result.isUserVersionGreater = true;
                if (await promptUpdate(promptMessage)) {
                    // defaultVersion = currentVersion;
                    result.version = currentVersion;
                    break;
                }
            }
        } else if (!isNaN(updateTo) && isNaN(user)) {
            result.isUserVersionGreater = true;
            if (await promptUpdate(promptMessage)) {
                // defaultVersion = currentVersion;
                result.version = currentVersion;
                break;
            }
        }
    }

    return result;
}

module.exports = {
    run,
    createAEprojectProjectStructure
}