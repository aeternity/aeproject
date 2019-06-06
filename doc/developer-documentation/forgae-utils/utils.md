# forgae-utils

## Install

```text
npm install forgae-utils
```

## Usage

`forgae-utils` is a package giving helper functions mainly for working with files and AEternity contracts.

### Available utils

* \`utils.readFileRelative\(relativePath, encoding, error\) giving you the ability to read content of a file in encoding of your preference

Example

```javascript
const contractSource = utils.readFileRelative(config.contractSourceFile, "utf-8");
const compiledContract = await client.contractCompile(contractSource, {
    gas: config.gas
})
```

* `utils.execute(cli, command, args = [], options = {})` is helping you spawn and run child processes 

Example

```javascript
const execute = require('forgae-utils').execute;
await execute('npm', 'install', [`forgae-lib@${forgaeLibVersion}`, '--save-exact', '--ignore-scripts', '--no-bin-links']);
```

* `utils.keyToHex(publicKey)`
* `utils.generatePublicKeyFromSecretKey(secretKey)`

