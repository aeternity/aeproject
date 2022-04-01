# Unit Testing

## Run unit tests

```text
aeproject test
```

The `test` command helps developers run their unit tests for æternity projects. The command executes the tests scripts that are located in the **test** folder of your æternity project. 

## Implement unit tests

In the `test/exampleTest.js` file you can find an example for unit testing using AEproject.

### 1. Dependencies

Javascript testing framework used with [mocha](https://mochajs.org/) for assertions, documented at https://www.chaijs.com/api/assert/

```js
const { assert } = require('chai');
```

Helper and utilities for AEproject use, e.g. prefunded wallets, network definition and utility functions for SDK initialization and snapshotting.

```js
const { networks, utils, wallets } = require('@aeternity/aeproject');
```

Read [AEproject Library](../lib.md) for a more detailed explanation about the usage of these imports.

### 2. SDK and Snapshotting Setup

Provide your initializations in mocha which need to be done once before all tests:
```js
before(...)
```

Initialize the default SDK instance with provided utils:
```js
const aeSdk = await utils.getSdk();
```

Get the filesystem definition for (custom) `includes` of the given contract:
```js
const filesystem = utils.getFilesystem(EXAMPLE_CONTRACT_SOURCE);
```

Read the contract source from the filesystem:
```js
const source = utils.getContractContent(EXAMPLE_CONTRACT_SOURCE);
```

Initialize the contract instance:
```js
const contract = await aeSdk.getContractInstance({ source, filesystem });
```

Deploy the contract:
```js
await contract.deploy();
```

Create a snapshot of the chain state once before all tests. This allows you to rollback to a clean state after each test if needed:
```js
await utils.createSnapshot(aeSdk);
```

Rollback to the previously created snapshot after each test for a clean state in the following tests:
```js
afterEach(async () => {
  await utils.rollbackSnapshot(aeSdk);
});
```

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

Use mocha for test setup and chai for `assert`. Then implement contract usage using the aeternity sdk as explained in the guide at https://github.com/aeternity/aepp-sdk-js/blob/develop/docs/guides/contracts.md#5-call-contract-entrypoints
