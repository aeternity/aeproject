# Migrate from 3.x.x to 4.x.x

## Migration of aeproject 3.x.x projects
**AEproject** `v4.0.0` underwent some bigger changes, is now available as official package of the aeternity organization on NPM and is compatible to the recently published node [v6.3.0](https://github.com/aeternity/aeternity/blob/v6.3.0/docs/release-notes/RELEASE-NOTES-6.3.0.md).

Install the new AEproject version
```
npm install -g @aeternity/aeproject
```

### Removed commands
Following commands have been removed and cannot be used anymore. Most of them didn't work properly or aren't used by anyone:

- `aeproject compatibility` (discontinued)
- `aeproject compile`
    -  manual compilation isn't needed for use of aeproject, alternatively use [aecli](https://github.com/aeternity/aepp-cli-js) or the [sdk](https://github.com/aeternity/aepp-sdk-js) programmatically
- `aeproject deploy`
    - deployment isn't supported in aeproject anymore, alternatively use [aecli](https://github.com/aeternity/aepp-cli-js) or the [sdk](https://github.com/aeternity/aepp-sdk-js) programmatically
- `aeproject export` (discontinued)
- `aeproject tx-inspector` 
    - manual tx inspection is moved to [aecli](https://github.com/aeternity/aepp-cli-js)
### Changed commands
- `aeproject init`
    - added the `folder` argument to create a new folder for the project initialization

### Important changes in the project structure
The latest available node and compiler will always be used with starting the testing environment.

Testing is now handled locally in the project using `mocha` and `chai` as direct dev dependencies.

`@aeternity/aeproject` is added itself as dependency and includes some library-functions that can be used in testing.

```
const { networks, utils, wallets } = require('@aeternity/aeproject');
```

- `networks` includes network definitions for local development, testnet and mainnet
- `wallets` includes example wallets that are prefunded in local development
- `utils` includes helper functions for testing
    - `getFilesystem(source)` to get the filesystem definition for a given contract for deployment
    - `getClient()` get a default client for local development
        - initialized with all prefunded wallets for `onAccount` to be used calling from different accounts
    - `awaitKeyBlocks(client, number)` await a certain number of key-blocks
    - `createSnapshot(client)` create a snapshot for local testing
    - `rollbackSnapshot(client)` rollback to previously created snapshot in local testing

## Migration of old projects
1. Upgrade your project
    ```
    aeproject init --update
    ```
    - adds new files needed
        - including new example contract and tests
    - prompts for files to replaced
        - docker setup for the node, compiler dev-mode setup should be accepted
        - example contract and example tests should not be accepted if used in your project for testing
    - automatically installs needed dependencies and removes unnecessary ones
   

2. Adapt Testing Setup (compare your tests with `test/exampleTest.js`) to
    - include `const { assert } = require('chai');` for assertions
    - replace `NETWORKS` import with `const { networks } = require('@aeternity/aeproject');` for networks definition
        - local testing network is now `devmode` instead of `local`
    - replace `defaultWallets` import with `const { wallets } = require('@aeternity/aeproject');` for prefunded wallets
    - replace `contractUtils` import with `const { utils } = require('@aeternity/aeproject');` for utils
        - consider using the new helpers for getting a client and creating snapshots similar to `test/exampleTest.js`
