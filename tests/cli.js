const path = require("path");
const chai = require("chai");
const chaiFiles = require("chai-files");

const { isEnvRunning } = require("../src/env/env");
const { version } = require("../package.json");
const { print } = require("../src/utils/utils");
const { exec, cwd, prepareLocal, cleanLocal, linkLocalLib } = require("./util");

chai.use(chaiFiles);
const { assert } = chai;
const { file } = chaiFiles;

describe("command line usage", () => {
  before(async () => await prepareLocal());
  after(() => cleanLocal());

  it("help", async () => {
    const res = await exec("aeproject help", { cwd });
    assert.equal(res.code, 0);
  });

  it("version", async () => {
    const res = await exec("aeproject --version", { cwd });
    assert.equal(res.code, 0);
    assert.include(res.stdout, version);
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const folder of [null, "testprojectfolder"]) {
    it(folder ? `init ${folder}` : "init", async () => {
      const res = await exec(
        folder ? `aeproject init ${folder}` : "aeproject init",
        { cwd },
      );
      assert.equal(res.code, 0);

      // link to use local aeproject utils
      await linkLocalLib(folder);

      assert.exists(file(path.join(cwd, ".gitignore")));
      assert.exists(file(path.join(cwd, "docker-compose.yml")));
      assert.exists(file(path.join(cwd, "package.json")));

      assert.exists(file(path.join(cwd, "contracts/ExampleContract.aes")));
      assert.exists(file(path.join(cwd, "docker/accounts.json")));
      assert.exists(file(path.join(cwd, "docker/aeternity.yaml")));
      assert.exists(file(path.join(cwd, "docker/nginx.conf")));
      assert.exists(file(path.join(cwd, "test/exampleTest.js")));
    });
  }

  it("env", async () => {
    const res = await exec("aeproject env", { cwd });
    assert.equal(res.code, 0);
    assert.isTrue(await isEnvRunning(cwd));

    // don't run for all gh-action matrix tests
    if (!process.env.AUX_CI_RUN) {
      const resSecond = await exec(
        "aeproject env --nodeVersion v6.10.0 --compilerVersion v7.4.0",
        { cwd },
      );
      assert.include(resSecond.stdout, "v6.10.0");
      assert.include(resSecond.stdout, "v7.4.0");

      const resThird = await exec("aeproject env", { cwd });
      assert.include(resThird.stdout, "updating");
    } else
      print("skipping env version and update tests for auxiliary test run");
  });

  it("env --restart", async () => {
    const res = await exec("aeproject env --restart", { cwd });
    assert.include(res.stdout, "restarting");
    assert.isTrue(await isEnvRunning(cwd));
  });

  it("env --info", async () => {
    const res = await exec("aeproject env --info", { cwd });
    assert.equal(res.code, 0);

    print(res.stdout);
  });

  it("test", async () => {
    const res = await exec("aeproject test", { cwd });
    assert.equal(res.code, 0);
    assert.equal(res.stderr, "");
    assert.include(res.stdout, "2 passing");
  });

  it("init --update --next; test", async () => {
    if (!process.env.AUX_CI_RUN) {
      const res = await exec("aeproject init --update --next -y", { cwd });
      assert.equal(res.code, 0);
      assert.equal(res.stderr, "");
      assert.include(
        res.stdout,
        "===== updating project file and directory structure =====",
      );
      assert.include(
        res.stdout,
        "===== updating project file and directory structure for next version =====",
      );

      assert.include(
        file(path.join(cwd, "docker-compose.yml")),
        "COMPILER_TAG:-latest",
      );
      assert.include(
        file(path.join(cwd, "docker-compose.yml")),
        "NODE_TAG:-latest",
      );

      const resEnv = await exec("aeproject env", { cwd });
      assert.equal(resEnv.code, 0);
      assert.isTrue(await isEnvRunning(cwd));

      assert.include(resEnv.stdout, "aeternity/aeternity       latest");
      assert.include(resEnv.stdout, "aeternity/aesophia_http   latest");

      const resTest = await exec("aeproject test", { cwd });
      assert.equal(resTest.code, 0);
      assert.include(resTest.stdout, "2 passing");
    } else console.log("skipping next test for auxiliary test run");
  });

  it("env --stop", async () => {
    const res = await exec("aeproject env --stop", { cwd });
    assert.equal(res.code, 0);
    assert.isFalse(await isEnvRunning(cwd));
  });
});
