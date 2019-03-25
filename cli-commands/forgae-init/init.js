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
require = require('esm')(module /*, options */) // use to handle es6 import/export

import {
	printError,
	print,
	createMissingFolder,
	copyFileOrDir
} from '../utils.js';

const constants = require('./constants.json');
const execute = require('./../utils').execute;
const packageJson = require('../../package.json')
const forgaeVersion = packageJson.version;
const sdkVersion = packageJson.dependencies['@aeternity/aepp-sdk'];

async function run(update) {
	if (update) {
		await updateForgaeProjectLibraries(sdkVersion, forgaeVersion);
		return;
	}

	try {
		await createForgaeProjectStructure();

	} catch (e) {
		printError(e.message)
		console.error(e);
	}
}

const createForgaeProjectStructure = async () => {
	print('===== Initializing ForgAE =====');

	await installLibraries()

	print(`===== Creating project file & dir structure =====`);

	setupContracts();
	setupTests();
	setupIntegrations();
	await setupDeploy();
	setupDocker();

	print('===== ForgAE was successfully initialized! =====');
}

const updateForgaeProjectLibraries = async (_sdkVersion, _forgaeVersion) => {
	print(`===== Updating ForgAE files =====`);

	setupDocker();
	await installForgae(_forgaeVersion)
	await installAeppSDK(_sdkVersion)
	await installYarn()

	print('===== ForgAE was successfully updated! =====');
}

const installLibraries = async () => {
	const fileSource = `${__dirname}${constants.artifactsDir}/package.json`;
	copyFileOrDir(fileSource, "./package.json")
	await installAeppSDK(sdkVersion)
	await installForgae(forgaeVersion)
	await installYarn()
}

const installAeppSDK = async (_sdkVersion = '') => {
	print('===== Installing aepp-sdk =====');
	await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', [`@aeternity/aepp-sdk@${_sdkVersion}`, '--save-exact']);
}

const installForgae = async (_forgaeVersion = '') => {

	print(`===== Installing ForgAE locally =====`);

	await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', [`forgae@${_forgaeVersion}`, '--save-exact', '--ignore-scripts', '--no-bin-links']);
}

const installYarn = async () => {
	print(`===== Installing yarn locally =====`);
	await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', ['yarn', '--save-exact', '--ignore-scripts', '--no-bin-links']);
}

const setupContracts = () => {
	print(`===== Creating contracts directory =====`);
	const fileSource = `${__dirname}${constants.artifactsDir}/${constants.contractTemplateFile}`;
	createMissingFolder(constants.contractsDir);
	copyFileOrDir(fileSource, constants.contractFileDestination)
}

const setupIntegrations = () => {
	print(`===== Creating integrations directory =====`);
	const fileSource = `${__dirname}${constants.artifactsDir}/${constants.contratsAeppSetting}`;
	createMissingFolder(constants.integrationsDir);
	copyFileOrDir(fileSource, constants.contratsAeppSettingFileDestination)
}

const setupTests = () => {
	print(`===== Creating tests directory =====`);
	const fileSource = `${__dirname}${constants.artifactsDir}/${constants.testTemplateFile}`;
	createMissingFolder(constants.testDir, "Creating tests file structure");
	copyFileOrDir(fileSource, constants.testFileDestination)
}

const setupDeploy = async () => {

	print(`===== Creating deploy directory =====`);
	const fileSource = `${__dirname}${constants.artifactsDir}/${constants.deployTemplateFile}`;
	createMissingFolder(constants.deployDir, "Creating deploy directory file structure");
	copyFileOrDir(fileSource, constants.deployFileDestination)
}

const setupDocker = () => {
	print(`===== Creating docker directory =====`);
	const dockerFilesSource = `${__dirname}${constants.artifactsDir}/${constants.dockerTemplateDir}`;
	const copyOptions = {
		overwrite: true
	}

	const dockerYmlFileSource = `${__dirname}${constants.artifactsDir}/${constants.dockerYmlFile}`;
	copyFileOrDir(dockerYmlFileSource, constants.dockerYmlFileDestination, copyOptions)
	copyFileOrDir(dockerFilesSource, constants.dockerFilesDestination, copyOptions)
}

module.exports = {
	run
}