# aeproject compile

## Compile Sophia Contracts

```text
aeproject compile
```

The `compile` command compiles Sophia Contracts with the `.aes` file extension. The default directory to be scanned for Sophia Contracts is `$projectDir/contracts`. The result of the compilation is the contract bytecode printed in the console. With the additional `--path` parameter you can specify the root-path of contracts to be compiled.

You can specify compiler using the `--compiler` parameter:
```text
aeproject compile --compiler http://localhost:3080
```

The default project (generated via `aeproject init`) also contains an example how to include other contracts.