const chai = require('chai');
const chaiFiles = require('chai-files');
const {utils} = require('@aeternity/aeproject');

const {exec, cwd, prepareLocal, cleanLocal, linkLocalLib} = require("./util");
const {assert} = require("chai");
const {generateKeyPair} = require("@aeternity/aepp-sdk");

chai.use(chaiFiles);

describe('library usage', () => {
    let aeSdk;

    before(async () => {
        await prepareLocal()
        await exec('aeproject init', {cwd});
        await linkLocalLib();

        await exec('aeproject env', {cwd});

        aeSdk = utils.getSdk();
    });

    after(async () => {
        await exec('aeproject env --stop', {cwd});
        cleanLocal()
    });

    it('await key blocks', async () => {
        const height = await aeSdk.getHeight();
        await utils.awaitKeyBlocks(aeSdk, 5);
        assert.equal(await aeSdk.getHeight(), height + 5);
    });

    it('rollback height', async () => {
        const height = await aeSdk.getHeight();

        const {publicKey} = generateKeyPair();
        await aeSdk.spend(100, publicKey)
        assert.equal(await aeSdk.getBalance(publicKey), 100);

        await utils.rollbackHeight(aeSdk, height);
        assert.equal(await aeSdk.getHeight(), height);
        assert.equal(await aeSdk.getBalance(publicKey), 0);
    });

    it('rollback snapshot', async () => {
        const height = await aeSdk.getHeight();
        await utils.createSnapshot(aeSdk);

        const {publicKey} = generateKeyPair();
        await aeSdk.spend(100, publicKey)
        assert.equal(await aeSdk.getBalance(publicKey), 100);

        await utils.rollbackSnapshot(aeSdk);
        assert.equal(await aeSdk.getHeight(), height);
        assert.equal(await aeSdk.getBalance(publicKey), 0);
    });
});
