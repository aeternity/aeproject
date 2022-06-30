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
Read the contract source from given path, just a wrapper for `fs.readFileSync` using `utf-8` encoding.

```javascript
utils.getFilesystem(contractPath);
```
Add the required filesystem imports for contract from given path, excluding the Sophia provided library imports.

```javascript
utils.get(url);
```
Promisified zero dependencies http `GET` request, usually used to control æternity node devmode endpoints.

```javascript
utils.getSdk();
```
Initialize the æternity SDK, pre-configured for optimal use in an AEproject project using æternity node devmode.

```javascript
utils.awaitKeyBlocks(aeSdk, n);
```
Create and wait for `n` number of key-blocks with the æternity node devmode, checked using the passed `aeSdk`.

```javascript
utils.createSnapshot(aeSdk);
```
Create a snapshot of the current chain state using the æternity node devmode, using the passed `aeSdk`.

```javascript
utils.rollbackSnapshot(aeSdk);
```
Rollback to the latest snapshot using the æternity node devmode, using the passed `aeSdk`.

```javascript
utils.getDefaultAccounts();
```
Get the pre-funded default accounts as `MemoryAccount`, so they can be used natively using the `aeSdk`.

## Wallets

List of configured keypairs that are pre-funded using the æternity node devmode as provided in AEproject. 

## Networks

Exposed URLs for commonly used `nodeUrl` and `compilerUrl`, per default local `devmode` and optionally hosted URLs for `mainnet` and `testnet`.
