import * as utils from "./../src/lib/utils";

import { exec, cwd, prepareLocal, cleanLocal, linkLocalLib } from "./util";
import { MemoryAccount } from "@aeternity/aepp-sdk";

describe("library usage", () => {
  let aeSdk;

  beforeAll(async () => {
    await prepareLocal();
    await exec("aeproject init", { cwd });
    await linkLocalLib();

    await exec("aeproject env", { cwd });

    aeSdk = utils.getSdk();
  });

  afterAll(async () => {
    await exec("aeproject env --stop", { cwd });
    cleanLocal();
  });

  it("await key blocks", async () => {
    const height = await aeSdk.getHeight();
    await utils.awaitKeyBlocks(aeSdk, 5);
    assert.equal(await aeSdk.getHeight(), height + 5);
  });

  it("rollback height", async () => {
    const height = await aeSdk.getHeight();

    const account = MemoryAccount.generate();
    await aeSdk.spend(100, account.address);
    assert.equal(await aeSdk.getBalance(account.address), 100);

    await utils.rollbackHeight(aeSdk, height);
    assert.equal(await aeSdk.getHeight(), height);
    assert.equal(await aeSdk.getBalance(account.address), 0);
  });

  it("rollback snapshot", async () => {
    const height = await aeSdk.getHeight();
    await utils.createSnapshot(aeSdk);

    const account = MemoryAccount.generate();
    await aeSdk.spend(100, account.address);
    assert.equal(await aeSdk.getBalance(account.address), 100);

    await utils.rollbackSnapshot(aeSdk);
    assert.equal(await aeSdk.getHeight(), height);
    assert.equal(await aeSdk.getBalance(account.address), 0);
  });
});
