# ForgAE

**ForgAE** is an aeternity framework which helps with setting up a project.
The framework makes the development of smart contracts in the aeternity network pretty easy. It provides commands
for compilation of smart contracts, running a local Epoch and unit testing the contracts.
In future deployment will be also available using forgae.

The framework can be installed via npm:
```
npm i -g forgae
```

It will be soon published in **npm** and will be available for installation

## Initialize Forgae

```

forgae init

```

The **init** command creates aeternity project structure with a few folders
in which the developer can create

the contracts, tests and deployment files and scripts. Docker configuration
files are also created, for easy use of the aeternity blockchain network.

The **init --update** command updates projects files. Important all files in docker folder and docker-compose will be replaced.

## Start your local development node

```

forgae node

```

The **node** command help developers run their local network on docker.
The local network contains 3 nodes. To spawn a fully functional network takes couple of minutes. At the end of this command you will be presented with accounts that you can use in your unit tests.
```
forgae node
```

To stop the local node, simply run
```
forgae node --stop
```

## Compile sophia contracts
```
forgae compile
```

The **compile** command compiles Sophia contract. It's recommended to use **.aes**
file extension. Default directory is $projectDir/contracts. The result of the compilation is the contract bytecode
printed in the console.
Additional **--path** parameter is available, which can specify the path to the contract to be compiled.

## Run deploy script

```
forgae deploy
```

The **deploy** command help developers run their deploy script aeternity
proejcts. The sample deploy script is scaffolded in deployment folder.

-You can specify nodeUrl, there are 3 options for nodeUrls: 
-- "local" -> http://localhost:3001 
-- "edgeNet" -> "https://sdk-edgenet.aepps.com",
-- "custom", you can specify custom nodeUrl.

--path -> You can set path to the deploy script

-s -> secretKey that will be used to deploy and call contracts

-Deployer.deploy(path, gasLimit) function takes 2 arguments: relative path to the contract and gasLimit

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

#### wallets
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
// Create client objects
owner = await Ae({
	url: config.host,
	internalUrl: config.internalHost,
	keypair: wallets[0],
	nativeMode: true,
	networkId: 'ae_devnet'
});

nonOwner = await Ae({
	url: config.host,
	internalUrl: config.internalHost,
	keypair: wallets[1],
	nativeMode: true,
	networkId: 'ae_devnet'
});
```
#### minerWallet
Similarly to `wallets` there is a global variable `minerWallet` representing the wallet of the node miner following the same structure.

##### Example
```
// Create client objects
miner = await Ae({
	url: config.host,
	internalUrl: config.internalHost,
	keypair: minerWallet,
	nativeMode: true,
	networkId: 'ae_devnet'
});
```

## History of your deploys

In order to see a list of what you've deployed you can run the following command:
```
forgae history [limit]
```

Parameters:
    limit - [Optional] By specifying --limit you can set the max number of historical records to be shown. Default is 5. 
    Example: 
    ```
    forgae history --limit 10
    ```
	
#### utils
`utils` is a package giving helper functions mainly for working with files. Most widely used one is `readFileRelative(relativePath, fileEncoding)`

##### readFileRelative Example
```
const contractSource = utils.readFileRelative(config.contractSourceFile, "utf-8");
const compiledContract = await client.contractCompile(contractSource, {
	gas: config.gas
})
```
