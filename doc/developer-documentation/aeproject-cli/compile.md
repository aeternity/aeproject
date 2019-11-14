# aeproject compile

## Compile sophia contracts

```text
aeproject compile
```

The **compile** command compiles Sophia contract. It's recommended to use **.aes** file extension. Default directory is $projectDir/contracts. The result of the compilation is the contract bytecode printed in the console. Additional **--path** parameter is available, which can specify the path to the contract to be compiled.

You can specify compiler using the **--compiler** parameter.

* "--compiler [http://localhost:3080](http://localhost:3080)" // AE compiler

  Example:

  ```text
  aeproject compile --compiler http://localhost:3080
  ```

The compiler allows you to include other **.aes** files to your contract by using the reserved word **include** and specifying the path to the file. You can add contracts, as well as namespaces.
PS: Also compiler support some default sophia's libraries. More info how to use these libraries 'List.aes', 'Option.aes', 'Func.aes', 'Pair.aes' and 'Triple.aes' can find here: https://github.com/aeternity/protocol/blob/master/contracts/sophia_stdlib.md

Example:

Let's say we want to include some helper functions from contracts *math-sum.aes* & *math-sub* to our *math.aes* contract

**math-sum.aes**
```
contract MathSum =
  entrypoint sum (x: int, y: int) : int =
    x + y

```

**math-sub.aes**
```
contract MathSub =
  entrypoint sub (x: int, y: int) : int =
    x - y
```

**math.aes**
```
include "./math-sum.aes"
include "./math-sub.aes"
include "List.aes"

contract Math =
  entrypoint sum(a : int, b: int) : int =
    MathSum.sum(a, b)

  entrypoint sub(x : int, y : int) : int =
    MathSub.sub(x, y)

  entrypoint is_empty() =
    List.is_empty([])
```
 