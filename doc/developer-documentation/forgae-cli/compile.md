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

The compiler allows you to include other **.aes** files to your contract by using the reserved word **include** and speciying the path to the file. You can add contracts, as well as namespaces.

Example:

Let's say we want to include some helper functions from contracts *math-sum.aes* & *math-sub* to our *math.aes* contract

**math-sum.aes**
```
contract MathSum =
    function sum (x: int, y: int) : int =
        x + y

```

**math-sub.aes**
```
contract MathSub =
    function sub (x: int, y: int) : int =
        x - y
```

**math.aes**
```
include "./math-sum.aes"
include "./math-sub.aes"

contract Math =
   public function sum(a : int, b: int) : int =
      MathSum.sum(a, b)

   public function sub(x : int, y : int) : int =
      MathSub.sub(x, y)
```
 