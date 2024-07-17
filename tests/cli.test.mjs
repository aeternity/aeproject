import path from "path";
import fs from "fs";

import { isEnvRunning } from "../src/env/env";
import { version } from "../package.json";
import { print } from "../src/utils/utils";
import { exec, cwd, prepareLocal, cleanLocal, linkLocalLib } from "./util.mjs";

describe("command line usage", () => {
  beforeAll(async () => await prepareLocal());
  afterAll(() => cleanLocal());

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

      assert.exists(fs.existsSync(path.join(cwd, ".gitignore")));
      assert.exists(fs.existsSync(path.join(cwd, "docker-compose.yml")));
      assert.exists(fs.existsSync(path.join(cwd, "package.json")));

      assert.exists(
        fs.existsSync(path.join(cwd, "contracts/ExampleContract.aes")),
      );
      assert.exists(fs.existsSync(path.join(cwd, "docker/accounts.json")));
      assert.exists(fs.existsSync(path.join(cwd, "docker/aeternity.yaml")));
      assert.exists(fs.existsSync(path.join(cwd, "docker/nginx.conf")));
      assert.exists(fs.existsSync(path.join(cwd, "test/exampleTest.js")));
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

  // latest currently doesn't work https://github.com/aeternity/aepp-sdk-js/issues/1999, https://github.com/aeternity/aeternity/issues/4376
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
        fs.readFileSync(path.join(cwd, "docker-compose.yml"), "utf8"),
        "COMPILER_TAG:-latest",
      );
      assert.include(
        fs.readFileSync(path.join(cwd, "docker-compose.yml"), "utf8"),
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
