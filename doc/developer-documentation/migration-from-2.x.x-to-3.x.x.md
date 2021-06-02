# Migratе from 2.x.x to 3.x.x (after Iris hardfork)

## Introduction
**AEproject** `v3.0.0` underwent some bigger changes, is now available as official package of the aeternity organization on NPM and is compatible to the recently published node [v6.0.0](https://github.com/aeternity/aeternity/blob/v6.0.0/docs/release-notes/RELEASE-NOTES-6.0.0.md) which triggers the Iris hardfork. If you have installed an old version of AEproject the following steps are recommended:
1. Uninstall the old AEproject version
    ```
    npm uninstall -g aeproject
    ```
1. Install the new AEproject version
    ```
    npm install -g @aeternity/aeproject
    ```

### Removed commands
Following commands have been removed and cannot be used anymore. Most of them didn't work properly or weren't used by anyone:
- `aeproject contracts`
- `aeproject fire-editor`
- `aeproject shape`
- `aeproject history`

### Important changes in the project structure
Separate NPM packages of AEproject which were includes as project dependencies in the `package.json` of new generated projects aren't published to NPM anymore at this point of time. Instead the required resources for tests and deployment are added to a new project when running `aeproject init`.

The provided example scripts for tests and deployment now directly use functionalities of the [JavaScript SDK](https://www.npmjs.com/package/@aeternity/aepp-sdk) instead of relying on a AEproject specific implementation.

It is now also possible to compile and deploy contracts which contain custom includes. New projects generated via `aeproject init` provide an example with an included library.

## Migration of old projects
If you already have an existing project that uses an old version of AEproject you need to adapt to the new version manually.

We recommend you to install the new version of AEproject and create an example project by running `aeproject init`. Take a look into the example tests and deployment script and compare the code to the old code in your current project.

The new examples rely on following files which you can copy from the new generated project:
- `./config/network.json`
- `./config/wallets.json`
- `./utils/contract-utils.js`

Additionally you need to compare and adapt the docker setup by taking a look into the following files:
- `./docker/aeterity.yaml`
    - you should expose the new external dry-run endpoint and you can remove some irrelevant configuration
- `./docker/nginx.conf`
    - this was the `nginx-default.conf` in the past and underwent some changes
- `./docker-compose.yml`
    - compare and change accordingly, too

You will also notice that `./docker` folder was cleaned up. You can also deleted unnecessary folders and files in your project.