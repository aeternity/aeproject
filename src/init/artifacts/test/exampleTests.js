const {assert} = require('chai');
const {Universal, MemoryAccount, Node} = require('@aeternity/aepp-sdk');
const {wallets, networks, utils} = require('@aeternity/aeproject');

const EXAMPLE_CONTRACT_SOURCE = './contracts/ExampleContract.aes';

describe('ExampleContract', () => {
  let contract;

  before(async () => {
    const client = await Universal({
      nodes: [{name: 'node', instance: await Node({url: networks.devmode.nodeUrl, ignoreVersion: true})}],
      compilerUrl: networks.devmode.compilerUrl,
      accounts: [MemoryAccount({keypair: wallets[0]})]
    });

    // a filesystem object must be passed to the compiler if the contract uses custom includes
    const filesystem = utils.getFilesystem(EXAMPLE_CONTRACT_SOURCE);

    // get content of contract
    const contract_content = utils.getContractContent(EXAMPLE_CONTRACT_SOURCE);

    // initialize the contract instance
    contract = await client.getContractInstance(contract_content, {filesystem});
  });

  it('deploy ExampleContract', async () => {
    await contract.deploy();
  });

  it('call ExampleContract', async () => {
    const {decodedResult} = await contract.methods.example(42)
    assert.equal(decodedResult, 42);
  });
});
