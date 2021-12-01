const { exec } = require('promisify-child-process');

const constants = require('./constants.json');
const { print } = require('../utils/utils');

const { copyFolderRecursiveSync, fileExists } = require('../utils/fs-utils');

async function run(update) {
  if (update) {
    await updateAEprojectProjectLibraries();
  } else {
    await createAEprojectProjectStructure();
  }
}

const createAEprojectProjectStructure = async () => {
  print('===== initializing aeproject =====');

  await setupArtifacts();
  await installDependencies();

  print('===== aeproject successfully initialized =====');
};

const updateAEprojectProjectLibraries = async () => {
  print('===== updating aeproject =====');

  await updateArtifacts();
  await installDependencies();

  print('===== aeproject sucessfully initalized =====');
};

const installDependencies = async () => {
  if (fileExists('./package.json')) {
    print('===== installing dependencies =====');
    await exec(/^win/.test(process.platform) ? 'npm.cmd install' : 'npm install');
  }
};

const setupArtifacts = async () => {
  print('===== creating project file and directory structure =====');

  await copyFolderRecursiveSync(`${__dirname}${constants.updateArtifactsDir}`, constants.artifactsDest);
  await copyFolderRecursiveSync(`${__dirname}${constants.artifactsDir}`, constants.artifactsDest);
};

const updateArtifacts = async () => {
  print('===== creating project file and directory structure =====');

  const fileSource = `${__dirname}${constants.updateArtifactsDir}`;
  const destination = constants.artifactsDest;

  await copyFolderRecursiveSync(fileSource, destination);
};

module.exports = {
  run,
};
