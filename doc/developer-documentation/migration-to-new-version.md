# Migratе Forgae 1.4 to 2.0

## Breaking changes

**Important** We have decided to separate our project to several packages as it's now getting bigger and the need of separation of concerns would become inevitable. Listed below are all the required steps we would like you to guide you through. Please note that all the steps are being made from the **root** folder of your project and are processed in due course.

* We strongly recommend that you do global uninstall of **aeproject** with `npm uninstall -g aeproject` and reinstall the newer version - `npm install -g aeproject`
* Delete your node\_modules folder, so that you do not keep the deprecated module in your project.
* Delete your old dependency to **aeproject** in the package.json file.
* Do `npm install`
* Now that you have **aeproject** globally, run `aeproject init --update` in your root directory. This will incorporate [aeproject-lib](aeproject-library-api/deployer.md) to your existing project
* Everywhere you have `require('aeproject').Deployer;` now should be amended to `require('aeproject-lib').Deployer`. 

### Deploying in v1.4

Example:

```javascript
const Deployer = require('aeproject').Deployer;

const deploy = async (network, privateKey, compiler) => {
    let deployer = new Deployer(network, privateKey, compiler)

    await deployer.deploy("./contracts/ExampleContract.aes")
};

module.exports = {
    deploy
};
```

### Deploying in v2.0

Here in v2.0 the Deployer is exposed through `aeproject-lib`

```javascript
const Deployer = require('aeproject-lib').Deployer;

const deploy = async (network, privateKey, compiler) => {
    let deployer = new Deployer(network, privateKey, compiler)

    await deployer.deploy("./contracts/ExampleContract.aes")
};

module.exports = {
    deploy
};
```

### Testing smart contract v1.2

```javascript
const Ae = require('@aeternity/aepp-sdk').Universal;

const config = {
    host: "http://localhost:3001/",
    internalHost: "http://localhost:3001/internal/",
    gas: 200000,
    ttl: 55,
    compilerUrl: 'https://localhost:3080'
}

describe('Example Contract', () => {

    let owner;
    let options = {
        ttl: config.ttl
    }

    before(async () => {
        const ownerKeyPair = wallets[0];
        owner = await Ae({
            url: config.host,
            internalUrl: config.internalHost,
            keypair: ownerKeyPair,
            nativeMode: true,
            networkId: 'ae_devnet',
            compilerUrl: config.compilerUrl
        });

    })

    it('Deploying Example Contract', async () => {
        let contractSource = utils.readFileRelative('./contracts/ExampleContract.aes', "utf-8"); // Read the aes file

        const compiledContract = await owner.contractCompile(contractSource, { // Compile it
        })
        // Deploy it
        // [] - empty init state object
        const deployPromise = compiledContract.deploy([], options);

        await assert.isFulfilled(deployPromise, 'Could not deploy the ExampleContract Smart Contract'); // Check it is deployed
    })

})
```

### Testing smart contract v2.0

Now the test file is completely reworked.

```javascript
const Deployer = require('aeproject-lib').Deployer;
const EXAMPLE_CONTRACT_PATH = "./contracts/ExampleContract.aes";

describe('Example Contract', () => {

    let deployer;
    let ownerKeyPair = wallets[0];

    before(async () => {
        deployer = new Deployer('local', ownerKeyPair.secretKey)
    })

    it('Deploying Example Contract', async () => {
        const deployPromise = deployer.deploy(EXAMPLE_CONTRACT_PATH) // Deploy it

        await assert.isFulfilled(deployPromise, 'Could not deploy the ExampleContract Smart Contract'); // Check whether it's deployed
    })
})
```

