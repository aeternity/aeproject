const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

async function prompt(action, target) {
  const response = await prompts({
    type: 'text',
    name: 'value',
    message: `Do you want to ${action} '${target}'? (y/N):`,
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
    } else if (await prompt('overwrite', dst)) {
      fs.writeFileSync(dst, fs.readFileSync(src));
    }
  }, Promise.resolve());
}

async function deleteWithPrompt(target) {
  if (fs.existsSync(target)) {
    if (await prompt('delete', target)) {
      fs.rmSync(target, { recursive: true });
    }
  }
}

module.exports = {
  copyFolderRecursiveSync,
  deleteWithPrompt,
};
