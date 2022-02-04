const chai = require('chai');

const { assert } = chai;

const { Universal, MemoryAccount, Node } = require('@aeternity/aepp-sdk');

const NETWORKS = require('../config/network.json');

const NETWORK_NAME = 'local';

const { defaultWallets: WALLETS } = require('../config/wallets.json');

const contractUtils = require('../utils/contract-utils');

const EXAMPLE_CONTRACT_SOURCE = './contracts/ExampleContract.aes';

describe('ExampleContract', () => {
  let contract;
  let hamsterName;

  before(async () => {
    const node = await Node({ url: NETWORKS[NETWORK_NAME].nodeUrl });
    const client = await Universal({
      nodes: [
        { name: NETWORK_NAME, instance: node },
      ],
      compilerUrl: NETWORKS[NETWORK_NAME].compilerUrl,
      accounts: [MemoryAccount({ keypair: WALLETS[0] })],
      address: WALLETS[0].publicKey,
    });
    try {
      // a filesystem object must be passed to the compiler if the contract uses custom includes
      const filesystem = contractUtils.getFilesystem(EXAMPLE_CONTRACT_SOURCE);
      // get content of contract
      const contract_content = contractUtils.getContractContent(EXAMPLE_CONTRACT_SOURCE);
      // initialize the contract instance
      contract = await client.getContractInstance(contract_content, { filesystem });
    } catch (err) {
      console.error(err);
      assert.fail('Could not initialize contract instance');
    }
  });

  it('Should deploy ExampleContract', async () => {
    await contract.deploy([]);
  });

  it('Should check if hamster has been created', async () => {
    hamsterName = 'C.Hamster';
    await contract.methods.createHamster(hamsterName);
    const result = await contract.methods.nameExists(hamsterName);
    assert.isTrue(result.decodedResult, 'hamster has not been created');
  });

  it('Should REVERT if hamster already exists', async () => {
    try {
      await contract.methods.createHamster('C.Hamster');
      assert.fail('createHamster didn\'t fail');
    } catch (err) {
      assert.include(err.message, 'Name is already taken', 'expected error message doesn\'t exist');
    }
  });

  it('Should return false if name does not exist', async () => {
    hamsterName = 'DoesHamsterExist';
    const result = await contract.methods.nameExists(hamsterName);
    assert.isFalse(result.decodedResult);
  });

  it('Should return true if the name exists', async () => {
    hamsterName = 'DoesHamsterExist';
    await contract.methods.createHamster(hamsterName);
    const result = await contract.methods.nameExists(hamsterName);
    assert.isTrue(result.decodedResult);
  });
});
