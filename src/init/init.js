import fs from "fs";
import path from "path";
import { exec } from "promisify-child-process";
import { print } from "../utils/utils.js";
import {
  copyFolderRecursiveSync,
  deleteWithPrompt,
} from "../utils/fs-utils.js";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";

const constants = JSON.parse(
  await readFile(new URL("../init/constants.json", import.meta.url)),
);
const packageJson = JSON.parse(
  await readFile(new URL("../../package.json", import.meta.url)),
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function patchForNextRelease(folder, y) {
  print(
    "===== updating project file and directory structure for next version =====",
  );

  const fileSource = `${__dirname}${constants.nextArtifactsDir}`;

  await copyFolderRecursiveSync(fileSource, folder, y);
}

function checkNodeVersion() {
  if (parseInt(process.version.split(".")[0].replace("v", ""), 10) < 16) {
    print("You need to use Node.js 16 or newer to use aeproject.");
    process.exit(1);
  }
}

function createFolder(folder) {
  if (folder !== constants.artifactsDest) {
    print(`creating project folder ${folder}`);
    fs.mkdirSync(folder);
  }
}

async function createAEprojectProjectStructure(folder) {
  print("===== initializing aeproject =====");

  await setupArtifacts(folder);
  await installDependencies(folder);

  print("===== aeproject successfully initialized =====");
  print(
    "test/exampleTest.js and contract/ExampleContract.aes have been added as example how to use aeproject",
  );
}

async function updateAEprojectProjectLibraries(folder, update, y) {
  print("===== updating aeproject =====");

  await updateArtifacts(folder, y);
  await installDependencies(folder, update);

  print("===== aeproject sucessfully initalized =====");
  print(
    "test/exampleTest.js and contract/ExampleContract.aes have been added as example how to use aeproject",
  );
}

async function installDependencies(folder, update = false) {
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
}

async function setupArtifacts(folder) {
  print("===== creating project file and directory structure =====");

  await copyFolderRecursiveSync(
    `${__dirname}${constants.updateArtifactsDir}`,
    path.join(constants.artifactsDest, folder),
  );
  await copyFolderRecursiveSync(
    `${__dirname}${constants.artifactsDir}`,
    path.join(constants.artifactsDest, folder),
  );
}

async function updateArtifacts(folder, y) {
  print("===== updating project file and directory structure =====");

  const fileSource = `${__dirname}${constants.updateArtifactsDir}`;

  await constants.deleteArtifacts.reduce(async (promiseAcc, artifact) => {
    await promiseAcc;
    await deleteWithPrompt(artifact, y);
  }, Promise.resolve());

  await copyFolderRecursiveSync(fileSource, folder, y);
}

export default { run };
