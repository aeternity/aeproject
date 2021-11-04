const p = require('path');
const {print} = require("../utils/utils");
const {getFiles} = require("../utils/fs-utils");
const contractUtils = require("../lib/utils");
const nodeConfig = require("../config/node-config.json");

const run = async (path) => {
  const workingDirectory = process.cwd();

  if (path.includes('.js')) {
    await test([path]);

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

  const files = await getFiles(`${testDirectory}/test`, '.*\\.(js|es|es6|jsx|sol)$');

  const cwd = process.cwd();
  process.chdir(testDirectory);

  await test(files);

  process.chdir(cwd);
};

async function test(files) {
  print('===== Starting Tests =====');
  const mochaConfig = {
    useColors: true,
    timeout: 550000,
    exit: true,
  };
  const mocha = await createMocha(mochaConfig, files);
  setGlobalOptions();

  for (let i = 0; i < files.length; i++) {
    delete originalRequire.cache[files[i]];
    mocha.addFile(files[i]);
  }

  await runMocha(mocha);
}

const createMocha = async (config, files) => {
  const mocha = new Mocha(config);

  files.forEach((file) => {
    mocha.addFile(file);
  });

  return mocha;
};

const runMocha = (mocha) => new Promise((resolve, reject) => {
  mocha.run((failures) => {
    process.exitCode = failures ? 1 : 0;
    if (failures) {
      reject(failures);
    } else {
      resolve();
    }
  });
});

async function setGlobalOptions() {
  global.assert = chai.assert;
  global.utils = contractUtils;
  global.minerWallet = nodeConfig.config.keyPair;
  global.wallets = nodeConfig.defaultWallets;
}


module.exports = {
  run,
};
