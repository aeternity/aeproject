const {Universal, MemoryAccount, Node, Crypto,} = require('@aeternity/aepp-sdk');
const contractUtils = require('../utils/contract-utils');

const NETWORKS = require('../config/network.json');

const DEFAULT_NETWORK_NAME = 'local';

const EXAMPLE_CONTRACT_SOURCE = './contracts/ExampleContract.aes';

const deploy = async (secretKey, network, compiler) => {
  if (!secretKey) {
    throw new Error('Required option missing: secretKey');
  }
  const KEYPAIR = {
    secretKey,
    publicKey: Crypto.getAddressFromPriv(secretKey),
  };
  const NETWORK_NAME = network || DEFAULT_NETWORK_NAME;

  const client = await Universal({
    nodes: [
      { name: NETWORK_NAME, instance: await Node({ url: NETWORKS[NETWORK_NAME].nodeUrl }) },
    ],
    compilerUrl: compiler || NETWORKS[NETWORK_NAME].compilerUrl,
    accounts: [MemoryAccount({ keypair: KEYPAIR })],
    address: KEYPAIR.publicKey,
  });
    // a filesystem object must be passed to the compiler if the contract uses custom includes
  const filesystem = contractUtils.getFilesystem(EXAMPLE_CONTRACT_SOURCE);
  // get content of contract
  const contract_content = contractUtils.getContractContent(EXAMPLE_CONTRACT_SOURCE);
  contract = await client.getContractInstance(contract_content, { filesystem });
  const deployment_result = await contract.deploy([]);
  console.log(deployment_result);
};

module.exports = {
  deploy,
};
