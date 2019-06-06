# forgae compile

## Compile sophia contracts

```text
forgae compile
```

The **compile** command compiles Sophia contract. It's recommended to use **.aes** file extension. Default directory is $projectDir/contracts. The result of the compilation is the contract bytecode printed in the console. Additional **--path** parameter is available, which can specify the path to the contract to be compiled.

You can specify network using the **-n** or **--network** option. There are 3 options for networks predefined and available:

* "local" - "[http://localhost:3001](http://localhost:3001)"
* "testnet" - "[https://sdk-testnet.aepps.com](https://sdk-testnet.aepps.com)"
* "mainnet" - "[https://sdk-mainnet.aepps.com](https://sdk-mainnet.aepps.com)"

Example:

```text
forgae compile -n testnet
```

You can specify compiler using the **--compiler** parameter.

* "--compiler [http://localhost:3080](http://localhost:3080)" // AE compiler

  Example:

  ```text
  forgae compile --compiler http://localhost:3080
  ```

