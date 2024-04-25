const fs = require("fs");
const path = require("path");

const { exec } = require("promisify-child-process");

const constants = require("./constants.json");
const packageJson = require("../../package.json");
const { print } = require("../utils/utils");

const {
  copyFolderRecursiveSync,
  deleteWithPrompt,
} = require("../utils/fs-utils");

async function run(folder, update, next, y) {
  checkNodeVersion();
  createFolder(folder);

  if (update) {
    await updateAEprojectProjectLibraries(folder, update, y);
  } else {
    await createAEprojectProjectStructure(folder);
  }

  // currently just patches to use latest node/compiler versions, can be reused in the future for upcoming breaking changes
  if (next) await patchForNextRelease(folder, y);
}

const patchForNextRelease = async (folder, y) => {
  print(
    "===== updating project file and directory structure for next version =====",
  );

  const fileSource = `${__dirname}${constants.nextArtifactsDir}`;

  await copyFolderRecursiveSync(fileSource, folder, y);
};

const checkNodeVersion = () => {
  if (parseInt(process.version.split(".")[0].replace("v", ""), 10) < 16) {
    print("You need to use Node.js 16 or newer to use aeproject.");
    process.exit(1);
  }
};

const createFolder = (folder) => {
  if (folder !== constants.artifactsDest) {
    print(`creating project folder ${folder}`);
    fs.mkdirSync(folder);
  }
};

const createAEprojectProjectStructure = async (folder) => {
  print("===== initializing aeproject =====");

  await setupArtifacts(folder);
  await installDependencies(folder);

  print("===== aeproject successfully initialized =====");
  print(
    "test/exampleTest.js and contract/ExampleContract.aes have been added as example how to use aeproject",
  );
};

const updateAEprojectProjectLibraries = async (folder, update, y) => {
  print("===== updating aeproject =====");

  await updateArtifacts(folder, y);
  await installDependencies(folder, update);

  print("===== aeproject sucessfully initalized =====");
  print(
    "test/exampleTest.js and contract/ExampleContract.aes have been added as example how to use aeproject",
  );
};

const installDependencies = async (folder, update = false) => {
  if (fs.existsSync(path.join(process.cwd(), folder, "package.json"))) {
    print("===== installing dependencies =====");
    const npm = /^win/.test(process.platform) ? "npm.cmd" : "npm";
    const installPromises = [`${npm} install`];

    installPromises.push(
      `${npm} install --save-dev @aeternity/aeproject@${packageJson.version}`,
    );

    if (update) {
      constants.dependencies.map((dependency) =>
        installPromises.push(`${npm} install ${dependency}`),
      );
      constants.devDependencies.map((dependency) =>
        installPromises.push(`${npm} install --save-dev ${dependency}`),
      );
      constants.uninstallDependencies.map((dependency) =>
        installPromises.push(`${npm} uninstall ${dependency}`),
      );
      installPromises.push(
        'npx npm-add-script -k "test" -v "mocha ./test/**/*.js --timeout 0 --exit" --force',
      );
    }

    await installPromises.reduce(async (promiseAcc, command) => {
      await promiseAcc;
      print(command);
      await exec(command, { cwd: path.join(process.cwd(), folder) });
    }, Promise.resolve());
  }
};

const setupArtifacts = async (folder) => {
  print("===== creating project file and directory structure =====");

  await copyFolderRecursiveSync(
    `${__dirname}${constants.updateArtifactsDir}`,
    path.join(constants.artifactsDest, folder),
  );
  await copyFolderRecursiveSync(
    `${__dirname}${constants.artifactsDir}`,
    path.join(constants.artifactsDest, folder),
  );
};

const updateArtifacts = async (folder, y) => {
  print("===== updating project file and directory structure =====");

  const fileSource = `${__dirname}${constants.updateArtifactsDir}`;

  await constants.deleteArtifacts.reduce(async (promiseAcc, artifact) => {
    await promiseAcc;
    await deleteWithPrompt(artifact, y);
  }, Promise.resolve());

  await copyFolderRecursiveSync(fileSource, folder, y);
};

module.exports = {
  run,
};
