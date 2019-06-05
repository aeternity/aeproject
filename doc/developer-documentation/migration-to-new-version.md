# Migration guide from Forgae v1.4 to v2.0

##Breaking changes

In your project run:

```text
npm install forgae-lib
```

Everywhere you have `require('forgae').Deployer;` now should be amended to `require('forgae-lib').Deployer`. 

**Important** We have decided to separate our project to several packages as it's now getting bigger and the need of separation of concerns would become inevitable.
Now when you already installed **forgae-lib** we strongly recommend that you do global uninstall of forgae with `npm uninstall -g forgae` and reinstall the newer version - `npm install -g forgae`

### Installing v2.0

#### Installing the CLI:
```test
npm install forgae
```

This command in v2.0 will install **only** the forgae CLI - (command line interface) library. You can use all the [CLI](https://app.gitbook.com/@forgae/s/forgae/v/develop/developer-documentation/forgae-cli) commands.

#### Installing the LIB:
```text
npm install forgae-lib
```

This command will instal **only** forgae [LIB](https://app.gitbook.com/@forgae/s/forgae/v/develop/developer-documentation/forgae-library-api/deployer). You can use LIB to deploy, instantiate or test smart contracts.

### Deploying in v1.4

Example:
```javascript
const Deployer = require('forgae').Deployer;

const deploy = async (network, privateKey, compiler) => {
    let deployer = new Deployer(network, privateKey, compiler)

    await deployer.deploy("./contracts/ExampleContract.aes")
};

module.exports = {
    deploy
};
```

### Deploying in v2.0

Here in v2.0 the Deployer is exposed through `forgae-lib`

```javascript
const Deployer = require('forgae-lib').Deployer;

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
    compilerUrl: 'https://compiler.aepps.com'
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
const Deployer = require('forgae-lib').Deployer;
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