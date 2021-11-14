const { exec } = require('promisify-child-process');
const { print } = require('../utils/utils');

const run = async () => {
  const workingDirectory = process.cwd();

  await test(workingDirectory);
};

async function test() {
  print('===== Starting Tests =====');

  const child = exec('npm test');

  child.stdout.on('data', (out) => process.stdout.write(out));
  child.stderr.on('data', (err) => process.stderr.write(err));
  await child;
}

module.exports = {
  run,
};
