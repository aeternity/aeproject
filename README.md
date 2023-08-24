# AEproject

[![npm version](https://badge.fury.io/js/%40aeternity%2Faeproject.svg)](https://badge.fury.io/js/%40aeternity%2Faeproject)

**AEproject** is an æternity framework which helps with setting up a project to develop and test [Sophia Smart Contracts](https://github.com/aeternity/aesophia). It provides commands to spin up a local environment as well as utilities for compiling and testing Sophia Smart Contracts. The initial scaffold provides an example contract & corresponding tests.

## Install

```text
npm install -g @aeternity/aeproject
```

## Documentation

- [Quick Start](docs/index.md)
- [Project Initialization](docs/cli/init.md)
- [Local Environment](docs/cli/env.md)
- [Unit Testing](docs/cli/test.md)
- [AEproject Library](docs/lib.md)
- [Migration from 3.x.x to 4.x.x](docs/migration-from-3.x.x-to-4.x.x.md)
- [Migration from 4.x.x to 5.x.x](docs/migration-from-4.x.x-to-5.x.x.md)
- [Upcoming Version Support](docs/next-support.md)

## Release Process

1. merge the release please PR
   - as `@aeternity/aeproject` has a dependency on itself as library, the CI run before publishing to npm after merging might fail
2. build locally and publish
   - checkout latest `origin/main` including the merged release please PR, ensure no local changes
   - publish to npm using `npm publish` (does automatically clean-build, may require login if not already)
