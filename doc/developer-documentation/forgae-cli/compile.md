# forgae compile

## Compile sophia contracts

```text
forgae compile
```

The **compile** command compiles Sophia contract. It's recommended to use **.aes** file extension. Default directory is $projectDir/contracts. The result of the compilation is the contract bytecode printed in the console. Additional **--path** parameter is available, which can specify the path to the contract to be compiled.

You can specify compiler using the **--compiler** parameter.

* "--compiler [http://localhost:3080](http://localhost:3080)" // AE compiler

  Example:

  ```text
  forgae compile --compiler http://localhost:3080
  ```

