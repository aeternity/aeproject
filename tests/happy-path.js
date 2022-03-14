const path = require('path');
const { exec: execP } = require('promisify-child-process');
const fs = require('fs');
const chai = require('chai');
const chaiFiles = require('chai-files');
const { isEnvRunning } = require('../src/env/env');
const { version } = require('../package.json');

chai.use(chaiFiles);
const { assert } = chai;
const { file } = chaiFiles;

const cwd = path.join(process.cwd(), '.testdir');
const exec = (cmd, options) => execP(`. ~/.profile;${cmd}`, options);

describe('Happy Path', () => {
  before(async () => {
    await exec('npm link');
    if (!fs.existsSync(cwd)) fs.mkdirSync(cwd);
  });

  after(() => {
    fs.rmSync(cwd, { recursive: true });
  });

  it('help', async () => {
    const res = await exec('aeproject help', { cwd });
    assert.equal(res.code, 0);
  });

  it('version', async () => {
    const res = await exec('aeproject --version', { cwd });
    assert.equal(res.code, 0);
    assert.include(res.stdout, version);
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const folder of [null, 'testprojectfolder']) {
    it(folder ? `init ${folder}` : 'init', async () => {
      const res = await exec(folder ? `aeproject init ${folder}` : 'aeproject init', { cwd });
      assert.equal(res.code, 0);

      // link to use local aeproject utils
      await exec('npm link @aeternity/aeproject', { cwd: folder ? path.join(cwd, folder) : cwd });

      assert.exists(file(path.join(cwd, '.gitignore')));
      assert.exists(file(path.join(cwd, 'docker-compose.yml')));
      assert.exists(file(path.join(cwd, 'package.json')));

      assert.exists(file(path.join(cwd, 'contracts/ExampleContract.aes')));
      assert.exists(file(path.join(cwd, 'docker/accounts.json')));
      assert.exists(file(path.join(cwd, 'docker/aeternity.yaml')));
      assert.exists(file(path.join(cwd, 'docker/nginx.conf')));
      assert.exists(file(path.join(cwd, 'test/exampleTest.js')));
    });
  }

  it('env', async () => {
    const res = await exec('aeproject env', { cwd });
    assert.equal(res.code, 0);
    assert.isTrue(await isEnvRunning(cwd));
  });

  it('test', async () => {
    const res = await exec('aeproject test', { cwd });
    assert.equal(res.code, 0);
    assert.equal(res.stderr, '');
    assert.include(res.stdout, '2 passing');
  });

  it('env --stop', async () => {
    const res = await exec('aeproject env --stop', { cwd });
    assert.equal(res.code, 0);
    assert.isFalse(await isEnvRunning(cwd));
  });
});
