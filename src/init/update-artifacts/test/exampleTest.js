const { assert } = require("chai");
const { utils } = require("@aeternity/aeproject");
const chaiAsPromised = require("chai-as-promised");
const chai = require("chai");

chai.use(chaiAsPromised);

const EXAMPLE_CONTRACT_SOURCE = "./contracts/ExampleContract.aes";

describe("ExampleContract", () => {
  let aeSdk;
  let contract;

  before(async () => {
    aeSdk = utils.getSdk();

    // a filesystem object must be passed to the compiler if the contract uses custom includes
    const fileSystem = utils.getFilesystem(EXAMPLE_CONTRACT_SOURCE);

    // get content of contract
    const sourceCode = utils.getContractContent(EXAMPLE_CONTRACT_SOURCE);

    // initialize the contract instance
    contract = await aeSdk.initializeContract({ sourceCode, fileSystem });
    await contract.init();

    // create a snapshot of the blockchain state
    await utils.createSnapshot(aeSdk);
  });

  // after each test roll back to initial state
  afterEach(async () => {
    await utils.rollbackSnapshot(aeSdk);
  });

  it("ExampleContract: set and get", async () => {
    const set = await contract.set(42, {
      onAccount: utils.getDefaultAccounts()[1],
    });
    assert.equal(set.decodedEvents[0].name, "SetXEvent");
    assert.equal(
      set.decodedEvents[0].args[0],
      utils.getDefaultAccounts()[1].address,
    );
    assert.equal(set.decodedEvents[0].args[1], 42);

    const { decodedResult } = await contract.get();
    assert.equal(decodedResult, 42);
  });

  it("ExampleContract: get undefined when not set before", async () => {
    await assert.isRejected(contract.get(), "NOTHING_SET_YET");
  });
});
