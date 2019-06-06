# Deployer

## Install

```text
npm install forgae-lib
```

## Usage

**Require**

Require of the package is done as follows:

```javascript
const Deployer = require('forgae-lib').Deployer;
```

**Deployer.deploy\(path, initState, options\)** function can take up to 3 parameters:

* path - relative path to the contract
* initState - variable for the arguments of the **init** function of the contract. Should be passed as an **array**
* options - Initial options that will be passed to init function

Example

```javascript
    let deployer = new Deployer(network, privateKey, compiler)
    await deployer.deploy("./contracts/ExampleContract.aes", [])
```

