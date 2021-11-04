const p = require('path');
const aeprojectTest = require('./aeproject-test');
const utils = require('../utils');

const run = async (path) => {
  const workingDirectory = process.cwd();

  if (path.includes('.js')) {
    await aeprojectTest.run([path]);

    return;
  }

  if (path.endsWith('./test')) {
    path = path.replace('./test', '');
  }

  let testDirectory;
  if (!workingDirectory.includes(path)) {
    testDirectory = p.join(workingDirectory, path);
  } else {
    testDirectory = workingDirectory;
  }

  const files = await utils.getFiles(`${testDirectory}/test`, '.*\\.(js|es|es6|jsx|sol)$');

  const cwd = process.cwd();
  process.chdir(testDirectory);

  await aeprojectTest.run(files);

  process.chdir(cwd);
};

module.exports = {
  run,
};
