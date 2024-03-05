# AEproject

[![npm version](https://badge.fury.io/js/%40aeternity%2Faeproject.svg)](https://badge.fury.io/js/%40aeternity%2Faeproject)

**AEproject** is an æternity framework which helps with setting up a project to develop and test [Sophia Smart Contracts](https://github.com/aeternity/aesophia). It provides commands to spin up a local environment as well as utilities for compiling and testing Sophia Smart Contracts. The initial scaffold provides an example contract & corresponding tests.

## Install

```text
npm install -g @aeternity/aeproject
```

## Documentation

* [Quick Start](docs/index.md)
* [Project Initialization](docs/cli/init.md)
* [Local Environment](docs/cli/env.md)
* [Unit Testing](docs/cli/test.md)
* [AEproject Library](docs/lib.md)
* [Migration from 3.x.x to 4.x.x](docs/migration-from-3.x.x-to-4.x.x.md)


## Release Process

As `@aeternity/aeproject` has a dependency on itself for initialised project we need a 2-step release process. 

1. add preparation commit, e.g. as https://github.com/aeternity/aeproject/commit/b448b445b0d151059fd88a0436e71599be042aad
   - in `src/init/artifacts/package.json` update the `@aeternity/aeproject` to the to be released version
   - push commit to `origin/main`, the CI run will eventually fail as it can't yet use the to be released version
2. merge the release please PR
3. build and publish locally
   - checkout latest `origin/main` including the merged release please PR, ensure no local changes
   - publish to npm using `npm publish` (may require login if not already)