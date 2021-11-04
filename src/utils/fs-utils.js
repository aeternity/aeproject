const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

async function promptOverwrite(target) {
  const response = await prompts({
    type: 'text',
    name: 'value',
    message: `Do you want to overwrite '${target}'? (y/N):`,
  });

  const input = response.value.trim();
  return input === 'YES' || input === 'yes' || input === 'Y' || input === 'y'
}

async function copyFolderRecursiveSync(srcDir, dstDir) {
  let src, dst;

  return fs.readdirSync(srcDir).reduce(async (accPromise, file) => {
    await accPromise;
    src = path.join(srcDir, file);
    dst = path.join(dstDir, file);

    const stat = fs.statSync(src);
    if (stat && stat.isDirectory()) {
      if (!fs.existsSync(dst)) {
        fs.mkdirSync(dst);
      }

      await copyFolderRecursiveSync(src, dst)
    } else {
      if (!fs.existsSync(dst)) {
        fs.writeFileSync(dst, fs.readFileSync(src));
      } else {
        if (await promptOverwrite(dst)) {
          fs.writeFileSync(dst, fs.readFileSync(src));
        }
      }
    }
  }, Promise.resolve());
}

const copyFileOrDir = (sourceFileOrDir, destinationFileOrDir, copyOptions = {}) => {
  if (fs.existsSync(`${destinationFileOrDir}`) && !copyOptions.overwrite) {
    throw new Error(`${destinationFileOrDir} already exists.`);
  }

  copySync(sourceFileOrDir, destinationFileOrDir, copyOptions);
};

const getFiles = async function (directory, regex) {
  return new Promise((resolve, reject) => {
    dir.files(directory, (error, files) => {
      if (error) {
        reject(new Error(error));
        return;
      }

      files = files.filter((file) => file.match(regex) != null);

      resolve(files);
    });
  });
};

const readFile = (path, encoding = null, errTitle = 'READ FILE ERR') => {
  try {
    return fs.readFileSync(
      path,
      encoding,
    );
  } catch (e) {
    switch (e.code) {
      case 'ENOENT':
        throw new Error('File not found');
      default:
        throw e;
    }
  }
};

const writeFile = (path, content) => {
  fs.writeFileSync(path, content);
};

const writeFileRelative = async (relativePath, content = null) => writeFile(path.resolve(process.cwd(), relativePath), content);

const readFileRelative = (relativePath, encoding = null, errTitle = 'READ FILE ERR') => readFile(path.resolve(process.cwd(), relativePath), encoding, errTitle);

const fileExists = (relativePath) => fs.existsSync(path.resolve(process.cwd(), relativePath));

function deleteCreatedFiles(testFiles) {
  for (const testFile of testFiles) {
    fs.unlink(testFile);
  }
}

async function createDirIfNotExists(destination) {
  if (path.parse(destination).ext !== '') {
    const lastIndexOf = destination.lastIndexOf('/');
    destination = destination.substring(0, lastIndexOf);
  }

  await fs.ensureDir(destination);
}

module.exports = {
  copyFileOrDir,
  getFiles,
  readFile,
  writeFile,
  writeFileRelative,
  readFileRelative,
  fileExists,
  deleteCreatedFiles,
  createDirIfNotExists,
  copyFolderRecursiveSync,
};
