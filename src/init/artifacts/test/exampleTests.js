const { assert } = require('chai');
const { utils } = require('@aeternity/aeproject');

const EXAMPLE_CONTRACT_SOURCE = './contracts/ExampleContract.aes';

describe('ExampleContract', () => {
  let client;
  let contract;

  before(async () => {
    client = await utils.getClient();

    // a filesystem object must be passed to the compiler if the contract uses custom includes
    const filesystem = utils.getFilesystem(EXAMPLE_CONTRACT_SOURCE);

    // get content of contract
    const contract_content = utils.getContractContent(EXAMPLE_CONTRACT_SOURCE);

    // initialize the contract instance
    contract = await client.getContractInstance(contract_content, { filesystem });
    await contract.deploy();

    // create a snapshot of the blockchain state
    await utils.createSnapshot(client);
  });

  // after each test roll back to initial state
  afterEach(async () => {
    await utils.rollbackSnapshot(client);
  });

  it('call ExampleContract', async () => {
    const { decodedResult } = await contract.methods.example(42);
    assert.equal(decodedResult, 42);
  });
});
