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
  return input === 'YES' || input === 'yes' || input === 'Y' || input === 'y';
}

async function copyFolderRecursiveSync(srcDir, dstDir) {
  let src; let
    dst;

  return fs.readdirSync(srcDir).reduce(async (accPromise, file) => {
    await accPromise;
    src = path.join(srcDir, file);
    dst = path.join(dstDir, file);

    const stat = fs.statSync(src);
    if (stat && stat.isDirectory()) {
      if (!fs.existsSync(dst)) {
        fs.mkdirSync(dst);
      }

      await copyFolderRecursiveSync(src, dst);
    } else if (!fs.existsSync(dst)) {
      fs.writeFileSync(dst, fs.readFileSync(src));
    } else if (await promptOverwrite(dst)) {
      fs.writeFileSync(dst, fs.readFileSync(src));
    }
  }, Promise.resolve());
}

const fileExists = (relativePath) => fs.existsSync(path.resolve(process.cwd(), relativePath));

module.exports = {
  fileExists,
  copyFolderRecursiveSync,
};
