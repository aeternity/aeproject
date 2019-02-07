const util = require('util');
const exec = util.promisify(require('child_process').exec);

const run = async () => {
  // console.log('Installing Contracts web Aepp');
  // await exec('npm install -g git+https://github.com/aeternity/aepp-contracts.git');

  exec('npm list -g --depth 0', function (error, stdout, stderr) {
    console.log(stdout);
    const globalModulesPath = stdout.split('\n')[0];
    console.log(globalModulesPath);
  });
};

module.exports = {
  run
};