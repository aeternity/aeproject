const path = require('path');
const { exec } = require('promisify-child-process');
const fs = require('fs');

const cwd = path.join(process.cwd(), '.testdir');

describe('Happy Path', () => {
  before(async () => {
    if (!fs.existsSync(cwd)) fs.mkdirSync(cwd);
  });

  after(() => {
    fs.rmdirSync(cwd);
  });

  it('init', async () => {
    await exec('aeproject init', { cwd });
  });

  it('env', async () => {
    await exec('aeproject env', { cwd });
  });

  it('test', async () => {
    await exec('aeproject test', { cwd });
  });

  it('env --stop', async () => {
    await exec('aeproject env --stop', { cwd });
  });
});
