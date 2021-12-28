const { exec } = require('promisify-child-process');

const constants = require('./constants.json');
const { print } = require('../utils/utils');

const { copyFolderRecursiveSync, fileExists, deleteWithPrompt } = require('../utils/fs-utils');

async function run(update) {
  checkNodeVersion();

  if (update) {
    await updateAEprojectProjectLibraries(update);
  } else {
    await createAEprojectProjectStructure();
  }
}

const checkNodeVersion = () => {
  if (parseInt(process.version.split('.')[0].replace('v', ''), 10) < 14) {
    print('You need to use Node.js 14 or newer to use aeproject.');
    process.exit(1);
  }
};

const createAEprojectProjectStructure = async () => {
  print('===== initializing aeproject =====');

  await setupArtifacts();
  await installDependencies();

  print('===== aeproject successfully initialized =====');
  print('test/exampleTest.js and contract/ExampleContract.aes have been added as example how to use aeproject');
};

const updateAEprojectProjectLibraries = async (update) => {
  print('===== updating aeproject =====');

  await updateArtifacts();
  await installDependencies(update);

  print('===== aeproject sucessfully initalized =====');
  print('test/exampleTest.js and contract/ExampleContract.aes have been added as example how to use aeproject');
};

const installDependencies = async (update = false) => {
  if (fileExists('./package.json')) {
    print('===== installing dependencies =====');
    const npm = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
    const installPromises = [`${npm} install`];

    if (update) {
      constants.dependencies.map((dependency) => installPromises.push(`${npm} install ${dependency}`));
      constants.devDependencies.map((dependency) => installPromises.push(`${npm} install --save-dev ${dependency}`));
      constants.uninstallDependencies.map((dependency) => installPromises.push(`${npm} uninstall ${dependency}`));
      installPromises.push('npx npm-add-script -k "test" -v "mocha ./test/**/*.js --timeout 0 --exit" --force');
    }

    await installPromises.reduce(async (promiseAcc, command) => {
      await promiseAcc;
      print(command);
      await exec(command);
    }, Promise.resolve());
  }
};

const setupArtifacts = async () => {
  print('===== creating project file and directory structure =====');

  await copyFolderRecursiveSync(`${__dirname}${constants.updateArtifactsDir}`, constants.artifactsDest);
  await copyFolderRecursiveSync(`${__dirname}${constants.artifactsDir}`, constants.artifactsDest);
};

const updateArtifacts = async () => {
  print('===== updating project file and directory structure =====');

  const fileSource = `${__dirname}${constants.updateArtifactsDir}`;
  const destination = constants.artifactsDest;

  await constants.deleteArtifacts
    .reduce(async (promiseAcc, artifact) => {
      await promiseAcc;
      await deleteWithPrompt(artifact);
    }, Promise.resolve());

  await copyFolderRecursiveSync(fileSource, destination);
};

module.exports = {
  run,
};
