# forgae test

## Run unit tests

```text
forgae test
```

The **test** command help developers run their unit tests for aeternity projects. The command executes the tests scripts that are located in the **test** folder of your aeternity project. Additional **--path** param is available, which can specify the path to the tests

Sophia developers can write tests in sophia language. They should create files including their tests with ".aes" extension in the "/test" folder. **forgae test** will look "sophia-tests.aes" file/s,  from which it will get the contract's name and check if this contract exists in "/contracts" folder. If it does, forgae will append the tests to the contract and will generate regular js file that will be executed. 
Sophia tests should have a certain syntax. Test functions that will be called and execute tests should start with  **test_** and should not accept parameters.
```
contract Calculator =
	
	public function test_sum_correct() =
			let result = 5
			require(sum(2,3) == result, "Result of sum is incorrect!")

	private function require(expression: bool, error_message: string) =
			if(!expression)
					abort(error_message)
```

Generated contract would look like:
```
contract Calculator =
	public function sum(a: int, b: int) = a + b

	public function test_sum_correct() =
		let result = 5
		require(sum(2,3) == result, "Result of sum is incorrect!")

	private function require(expression: bool, error_message: string) =
		if(!expression)
			abort(error_message)
```
It would have been deployed and called test's functions.

### Special global variables and modules available for unit tests

forgae exposes special convenience global variables and functions that can be used in the unit tests.

#### Wallets

Global wallets array is available to be used by the developer. Wallets has 10 items all representing the 10 `forgae node` wallets created on the node start. Every item has the structure of:

```text
{
    "publicKey": "ak_fUq2NesPXcYZe...",
    "secretKey": "7c6e602a94f30e4e..."
}
```

This structure makes it very convenient for creation of SDK client objects

**Example**

```text
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

**Example**

```text
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

