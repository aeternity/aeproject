# Unit Testing

## Run unit tests

```text
aeproject test
```

The `test` command helps developers run their unit tests for aeternity projects. The command executes the tests scripts that are located in the **test** folder of your aeternity project. 

## Implement unit tests

In the `test/exampleTest.js` file you can find an example for unit testing using aeproject.

### 1. Dependencies

`const { assert } = require('chai');`
Javascript testing framework used with [mocha](https://mochajs.org/) for assertions, documented at https://www.chaijs.com/api/assert/

`const { networks, utils, wallets } = require('@aeternity/aeproject');` Helper and utilities for aeproject use, e.g. prefunded wallets, network definition and utility functions for client initialization and snapshotting.

### 2. Client and Snapshotting Setup

`before(...)` used in mocha for initializations needed to be done once before all tests

`client = await utils.getClient();` use included utils to initialize default aeternity client

`const filesystem = utils.getFilesystem(EXAMPLE_CONTRACT_SOURCE);` use utils to get filesystem definition for given contract

`const source = utils.getContractContent(EXAMPLE_CONTRACT_SOURCE);` read contract source from filesystem

`contract = await client.getContractInstance({ source, filesystem });` initialize contract instance with client

`await contract.deploy();` deploy initialized contract

`await utils.createSnapshot(client);` create snapshot once before all tests, so we can rollback to a clean state after each test

```javascript
afterEach(async () => {
  await utils.rollbackSnapshot(client);
});
```

after each test use the util to rollback to previously created snapshot for a clean state in the following tests

### 3. Example Test

```javascript
it('ExampleContract: set and get', async () => {
  const set = await contract.methods.set(42, { onAccount: wallets[1].publicKey });
  assert.equal(set.decodedEvents[0].name, 'SetXEvent');
  assert.equal(set.decodedEvents[0].decoded[0], wallets[1].publicKey);
  assert.equal(set.decodedEvents[0].decoded[1], 42);

  const { decodedResult } = await contract.methods.get();
  assert.equal(decodedResult, 42);
});
```

use mocha for test setup and chai for `assert`. Then implement contract usage using the aeternity sdk as explained in the guide at https://github.com/aeternity/aepp-sdk-js/blob/develop/docs/guides/contracts.md#5-call-contract-entrypoints
