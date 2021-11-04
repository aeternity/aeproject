const { print } = require('../utils');
const contractUtils = require('../utils');
const nodeConfig = require('../config');

// TODO remove mocha and chai

async function run(files) {
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
