# AEproject Library

Installed automatically with each project initialized with `aeproject init`, otherwise can be installed using `npm i @aeternity/aeproject`.

Available imports include helper definitions and utils using:
```javascript
const { utils, wallets, networks } = require('@aeternity/aeproject');
```

## Utils
```javascript
utils.getContractContent(contractPath);
```
Read contract source from given path, just a wrapper for `fs.readFileSync` using `utf-8` encoding.

```javascript
utils.getFilesystem(contractPath);
```
Add required filesystem imports for contract from given path, excluding the sophia provided library imports.

```javascript
utils.get(url);
```
Promisified zero dependencies http `GET` request, usually used to control aeternity node devmode endpoints.

```javascript
utils.getSdk();
```
Initialize aeternity sdk, preconfigured for optimal use in an AEproject project using aeternity node devmode.

```javascript
utils.awaitKeyBlocks(aeSdk, n);
```
Util to create and wait for `n` number of key-blocks with the aeternity node devmode, checked using the passed `aeSdk`.

```javascript
utils.createSnapshot(aeSdk);
```
Util to create a snapshot of the current chain state using the aeternity node devmode, using the passed `aeSdk`.

```javascript
utils.rollbackSnapshot(aeSdk);
```
Util to rollback to the latest snapshot using the aeternity node devmode, using the passed `aeSdk`.

## Wallets

List of configured keypairs that are prefunded using the aeternity node devmode as provided in AEproject. 

## Networks

Exposed urls for commonly used `nodeUrl` and `compilerUrl`, per default local `devmode` and optionally hosted urls for `mainnet` and `testnet`.
