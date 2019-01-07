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
require = require('esm')(module /*, options */ ) // use to handle es6 import/export

import {
  printError,
  print,
  createIfExistsFolder,
  copyFileOrDir,
} from '../utils.js'
const constants = require('./constants.json');
const execute = require('./../utils').execute;

async function run(update) {
  if (update) {
    print(`===== Updating ForgAE files =====`);

    setupDocker();

    print('===== ForgAE was successfully updated! =====');
    return;
  }

  try {
    print('===== Initializing ForgAE =====');

    await installLibraries()

    print(`===== Creating project file & dir structure =====`);

    setupContracts();
    setupTests();
    await setupDeploy();
    setupDocker();

    print('===== ForgAE was successfully initialized! =====');

  } catch (e) {
    printError(e.message)
    console.error(e);
  }
}

const installLibraries = async () => {
  const fileSource = `${__dirname}${constants.artifactsDir}/package.json`;
  copyFileOrDir(fileSource, "./package.json")
  await installAeppSDK();
}

const installAeppSDK = async () => {
  print('===== Installing aepp-sdk =====');

  await execute('npm', 'install', ['@aeternity/aepp-sdk@1.0.1', '--save-exact']);
}

const setupContracts = () => {
  print(`===== Creating contracts directory =====`);
  const fileSource = `${__dirname}${constants.artifactsDir}/${constants.contractTemplateFile}`;
  createIfExistsFolder(constants.contractsDir);
  copyFileOrDir(fileSource, constants.contractFileDestination)
}

const setupTests = () => {
  print(`===== Creating tests directory =====`);
  const fileSource = `${__dirname}${constants.artifactsDir}/${constants.testTemplateFile}`;
  createIfExistsFolder(constants.testDir, "Creating tests file structure");
  copyFileOrDir(fileSource, constants.testFileDestination)
}

const setupDeploy = async () => {
  print(`===== Installing ForgAE locally =====`);

  await execute('npm', 'install', ['git+https://github.com/aeternity/aepp-forgae-js.git', '--save']);

  print(`===== Creating deploy directory =====`);
  const fileSource = `${__dirname}${constants.artifactsDir}/${constants.deployTemplateFile}`;
  createIfExistsFolder(constants.deployDir, "Creating deploy directory file structure");
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