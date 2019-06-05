# forgae test

## Run unit tests

```
forgae test
```

The **test** command help developers run their unit tests for aeternity
projects. The command executes the tests scripts that are located in the
**test** folder of your aeternity project.
Additional **--path** param is available, which can specify the path to the tests

### Special global variables and modules available for unit tests

forgae exposes special convenience global variables and functions that can be used in the unit tests.

#### Wallets
Global wallets array is available to be used by the developer. Wallets has 10 items all representing the 10 `forgae node` wallets created on the node start. Every item has the structure of:
```
{
	"publicKey": "ak_fUq2NesPXcYZe...",
	"secretKey": "7c6e602a94f30e4e..."
}
```
This structure makes it very convenient for creation of SDK client objects
##### Example
```
const host: "http://localhost:3001/",
const internalHost: "http://localhost:3001/internal/",

// Create client objects
owner = await Ae({
	url: host,
	internalUrl: internalHost,
	keypair: wallets[0],
	nativeMode: true,
	networkId: 'ae_devnet',
	compilerUrl: 'http://localhost:3080/'
});

nonOwner = await Ae({
	url: host,
	internalUrl: internalHost,
	keypair: wallets[1],
	nativeMode: true,
	networkId: 'ae_devnet',
	compilerUrl: 'http://localhost:3080/'
});
```
#### minerWallet
Similarly to `wallets` there is a global variable `minerWallet` representing the wallet of the node miner following the same structure.

##### Example
```
// Create client objects
miner = await Ae({
	url: host,
	internalUrl: internalHost,
	keypair: minerWallet,
	nativeMode: true,
	networkId: 'ae_devnet',
	compilerUrl: 'http://localhost:3080/'
});
```