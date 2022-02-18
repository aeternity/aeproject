const path = require('path');
const { exec: execP } = require('promisify-child-process');
const fs = require('fs');
const chai = require('chai');
const chaiFiles = require('chai-files');

chai.use(chaiFiles);
const { assert } = chai;
const { file } = chaiFiles;

const cwd = path.join(process.cwd(), '.testdir');
const exec = (cmd, options) => execP(`source ~/.profile;${cmd}`, options);

describe('Happy Path', () => {
  before(async () => {
    await exec('npm link');
    if (!fs.existsSync(cwd)) fs.mkdirSync(cwd);
  });

  after(() => {
    fs.rmSync(cwd, { recursive: true });
  });

  it('init', async () => {
    await exec('aeproject init', { cwd });

    assert.exists(file(path.join(cwd, '.gitignore')));
    assert.exists(file(path.join(cwd, 'docker-compose.yml')));
    assert.exists(file(path.join(cwd, 'package.json')));

    assert.exists(file(path.join(cwd, 'contracts/ExampleContract.aes')));
    assert.exists(file(path.join(cwd, 'docker/accounts.json')));
    assert.exists(file(path.join(cwd, 'docker/aeternity.yaml')));
    assert.exists(file(path.join(cwd, 'docker/nginx.conf')));
    assert.exists(file(path.join(cwd, 'test/exampleTest.js')));
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
