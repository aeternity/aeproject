const prompts = require('prompts');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const { sdkVersion } = require('./constants.json');
const { execute, printError, print, createMissingFolder, copyFileOrDir, writeFileRelative, readFileRelative } = require('../utils');
const config = require('../config');

async function run(update) {
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

const createAEprojectProjectStructure = async () => {
  print('===== Initializing AEproject =====');
  await installLibraries();

  print('===== Creating project file & dir structure =====');

  await setupContracts();
  await setupTests();
  await setupDeploy();
  await setupDocker();
  await setupConfig();
  await addIgnoreFile();

  print('===== AEproject was successfully initialized! =====');
};

const compareSdkVersions = async (_sdkVersion, cwd) => {
  // get current sdk version
  const userPackageJson = JSON.parse(fs.readFileSync(path.join(cwd, './package.json'), 'utf8'));
  const userSdkVersion = userPackageJson.dependencies['@aeternity/aepp-sdk'];

  if (userSdkVersion) {
    const userVersioning = userSdkVersion.split('.');
    const updateToVersioning = _sdkVersion.split('.');

    const promptMessage = `Found newer or different version of sdk ${userSdkVersion}. Keep it, instead of ${_sdkVersion}?`;

    for (let i = 0; i < 3; i++) {
      const user = userVersioning[i];
      const updateTo = updateToVersioning[i];

      if (!isNaN(user)) {
        if (parseInt(user) > parseInt(updateTo)) {
          if (await promptUpdate(promptMessage)) {
            _sdkVersion = userSdkVersion;
            break;
          }
        }
      } else if (await promptUpdate(promptMessage)) {
        _sdkVersion = userSdkVersion;
        break;
      }
    }
  }

  return _sdkVersion;
};

const updateAEprojectProjectLibraries = async (_sdkVersion, update) => {
  print('===== Updating AEproject files =====');

  _sdkVersion = await compareSdkVersions(_sdkVersion, process.cwd());

  await setupDocker(true);
  await installAEproject(update);

  print('===== AEproject was successfully updated! =====');
};

const installLibraries = async () => {
  const fileSource = `${__dirname}${constants.artifactsDir}/package.json`;
  try {
    copyFileOrDir(fileSource, './package.json');
  } catch (error) {
    if (error.message.includes('already exists')) {
      await prompt(error, copyFileOrDir, fileSource, './package.json');
    } else {
      throw Error(error);
    }
  }

  await installAeppSDK(sdkVersion);
  await installAEproject();
};

const installAeppSDK = async (_sdkVersion = '') => {
  print('===== Installing aepp-sdk =====');
  await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', [`@aeternity/aepp-sdk@${_sdkVersion}`, '--save-exact']);
};

const installAEproject = async (isUpdate) => {
  print('===== Installing other dependencies =====');
  await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', ['prompts']);
  await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', ['chai', '--save-dev']);
  await execute(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', 'install', ['mocha', '--save-dev']);
};

const setupContracts = async () => {
  print('===== Creating contracts & utils directory =====');
  let fileSource = `${__dirname}${constants.artifactsDir}/${constants.contractTemplateFile}`;
  createMissingFolder(constants.contractsDir);
  let destination = constants.contractFileDestination;
  try {
    copyFileOrDir(fileSource, destination);
  } catch (error) {
    if (error.message.includes('already exists')) {
      await prompt(error, copyFileOrDir, fileSource, destination);
    } else {
      throw Error(error);
    }
  }
  createMissingFolder(`${constants.contractsDir}/lib`);
  fileSource = `${__dirname}${constants.artifactsDir}/ExampleLibrary.aes`;
  destination = `${constants.contractsDir}/lib/ExampleLibrary.aes`;
  try {
    copyFileOrDir(fileSource, destination);
  } catch (error) {
    if (error.message.includes('already exists')) {
      await prompt(error, copyFileOrDir, fileSource, destination);
    } else {
      throw Error(error);
    }
  }
  createMissingFolder('./utils');
  fileSource = `${__dirname}/../utils/utils/contract-utils.js`;
  destination = './utils/contract-utils.js';
  try {
    copyFileOrDir(fileSource, destination);
  } catch (error) {
    if (error.message.includes('already exists')) {
      await prompt(error, copyFileOrDir, fileSource, destination);
    } else {
      throw Error(error);
    }
  }
};

const setupConfig = async () => {
  print('===== Creating config directory =====');
  createMissingFolder('./config');
  let fileSource = `${__dirname}/artifacts/network.json`;
  let destination = './config/network.json';
  try {
    copyFileOrDir(fileSource, destination);
  } catch (error) {
    if (error.message.includes('already exists')) {
      await prompt(error, copyFileOrDir, fileSource, destination);
    } else {
      throw Error(error);
    }
  }
  fileSource = `${__dirname}/artifacts/wallets.json`;
  destination = './config/wallets.json';
  try {
    copyFileOrDir(fileSource, destination);
  } catch (error) {
    if (error.message.includes('already exists')) {
      await prompt(error, copyFileOrDir, fileSource, destination);
    } else {
      throw Error(error);
    }
  }
};

const setupTests = async () => {
  print('===== Creating tests directory =====');
  const fileSource = `${__dirname}${constants.artifactsDir}/${constants.testTemplateFile}`;
  createMissingFolder(constants.testDir, 'Creating tests file structure');

  try {
    copyFileOrDir(fileSource, constants.testFileDestination);
  } catch (error) {
    if (error.message.includes('already exists')) {
      await prompt(error, copyFileOrDir, fileSource, constants.testFileDestination);
    } else {
      throw Error(error);
    }
  }
};

const setupDeploy = async () => {
  print('===== Creating deploy directory =====');
  const fileSource = `${__dirname}${constants.artifactsDir}/${constants.deployTemplateFile}`;
  createMissingFolder(constants.deployDir, 'Creating deploy directory file structure');

  try {
    copyFileOrDir(fileSource, constants.deployFileDestination);
  } catch (error) {
    if (error.message.includes('already exists')) {
      await prompt(error, copyFileOrDir, fileSource, constants.deployFileDestination);
    } else {
      throw Error(error);
    }
  }
};

const setDockerImageVersion = (pathToDockerYmlFile, dockerImage) => {
  const doc = yaml.safeLoad(fs.readFileSync(pathToDockerYmlFile, 'utf8'));

  const tokens = dockerImage.split(':');
  const imageLiteral = tokens[0];

  for (const i in doc.services) {
    const { image } = doc.services[i];

    if (image.startsWith(imageLiteral)) {
      doc.services[i].image = dockerImage;
    }
  }

  const yamlStr = yaml.safeDump(doc);
  fs.writeFileSync(pathToDockerYmlFile, yamlStr, 'utf8');
};

const setupDocker = async (isUpdate) => {
  print('===== Creating docker directory =====');

  const dockerFilesSource = `${__dirname}${constants.artifactsDir}/${constants.dockerTemplateDir}`;
  const dockerNodeYmlFileSource = `${__dirname}${constants.artifactsDir}/${constants.dockerNodeYmlFile}`;
  const dockerCompilerYmlFileSource = `${__dirname}${constants.artifactsDir}/${constants.dockerCompilerYmlFile}`;

  const nodeTokens = constants.aeNodeImage.split(':');
  const compilerTokens = constants.aeCompilerImage.split(':');

  const nodeVersion = [];
  const compilerVersion = [];

  if (isUpdate) {
    const aeternityNodeImageLiteral = nodeTokens[0];
    const aeternityCompilerImageLiteral = compilerTokens[0];

    try {
      // read user's node yml
      const userNodeYmlPath = path.join(process.cwd(), constants.dockerNodeYmlFile);
      const doc = yaml.safeLoad(fs.readFileSync(userNodeYmlPath, 'utf8'));

      for (const i in doc.services) {
        const { image } = doc.services[i];

        if (image.startsWith(aeternityNodeImageLiteral)) {
          const imageTokens = image.split(':');
          const currentVersion = imageTokens[1];

          nodeVersion.push(currentVersion);
        }
      }
    } catch (e) {
      console.log(e);
    }

    try {
      // read user's compiler yml
      const userCompilerYmlPath = path.join(process.cwd(), constants.dockerCompilerYmlFile);
      const doc = yaml.safeLoad(fs.readFileSync(userCompilerYmlPath, 'utf8'));

      for (const i in doc.services) {
        const { image } = doc.services[i];

        if (image.startsWith(aeternityCompilerImageLiteral)) {
          const imageTokens = image.split(':');
          const currentVersion = imageTokens[1];

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

  const promptNodeMessage = `Default node version is ${defaultNodeVersion}, found ${nodeVersion[0]}. Do you want to keep current .yml file with node version: ${nodeVersion[0]} instead of default one with ${defaultNodeVersion}?`;
  const nodeResult = await compareVersion(nodeVersion[0], defaultNodeVersion, promptNodeMessage);

  const promptCompilerMessage = `Default compiler version is ${defaultCompilerVersion}, found ${compilerVersion[0]}. Do you want to keep current .yml file with compiler version: ${compilerVersion[0]} instead of default one with ${defaultCompilerVersion}?`;
  const compilerResult = await compareVersion(compilerVersion[0], defaultCompilerVersion, promptCompilerMessage);

  if (nodeResult.version !== defaultNodeVersion) {
    setDockerImageVersion(dockerNodeYmlFileSource, `${aeternityNodeImageLiteral}:${nodeResult.version}`);
  }

  if (compilerResult.version !== defaultCompilerVersion) {
    setDockerImageVersion(dockerCompilerYmlFileSource, `${aeternityCompilerImageLiteral}:${compilerResult.version}`);
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
    setDockerImageVersion(dockerNodeYmlFileSource, `${aeternityNodeImageLiteral}:\${${config.nodeConfiguration.envLiteral}}`);
  }

  if (compilerResult.version !== defaultCompilerVersion) {
    setDockerImageVersion(dockerCompilerYmlFileSource, `${aeternityCompilerImageLiteral}:\${${config.compilerConfiguration.envLiteral}}`);
  }
};

const addIgnoreFile = () => {
  print('==== Adding additional files ====');
  const ignoreFileContent = readFileRelative(`${__dirname}${constants.artifactsDir}/${constants.gitIgnoreContent}`);
  writeFileRelative(constants.gitIgnoreFile, ignoreFileContent);
};

async function prompt(error) {
  const args = [...arguments];
  // [0] - error
  // [1] - function to execute
  // [..] rest = function arguments

  const funcToExecute = args[1];

  // // Prompt user to input data in console.
  const response = await prompts({
    type: 'text',
    name: 'value',
    message: `${error.message}\nDo you want to overwrite '${error.message.replace(' already exists.', '')}'? (YES/no):`,
    // validate: value => value < 18 ? `some validation text` : true
  });

  const input = response.value;
  if (input === 'YES' || input === 'yes' || input === 'Y' || input === 'y') {
    funcToExecute(...args.slice(2), {
      overwrite: true,
    });

    return true;
  }

  console.log(`'${error.message.replace(' already exists.', '')}' will not be overwritten.`);
  return false;
}

async function promptUpdate(message) {
  // // Prompt user to input data in console.
  const response = await prompts({
    type: 'text',
    name: 'value',
    message: `${message} (Y/n):`,
    // validate: value => value < 18 ? `some validation text` : true
  });

  const input = response.value;
  if (input === 'YES' || input === 'yes' || input === 'Y' || input === 'y') {
    return true;
  }

  return false;
}

const compareVersion = async (currentVersion, defaultVersion, promptMessage) => {
  const result = {
    version: defaultVersion,
    isUserVersionGreater: false,
  };

  if (!currentVersion) {
    return result;
  }

  const currentVersionTokens = currentVersion.replace('v', '').split('.');
  const defaultVersionTokens = defaultVersion.replace('v', '').split('.');

  for (let i = 0; i < 3; i++) {
    const user = currentVersionTokens[i];
    const updateTo = defaultVersionTokens[i];

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
};

module.exports = {
  run,
  createAEprojectProjectStructure,
};
