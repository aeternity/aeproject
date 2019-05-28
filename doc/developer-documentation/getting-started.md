# Quick Start

## Access deployed smart contract functions
You can execute function of smart contract from deployed instance

Examples
```
contract ExampleContract =

  public function sayHello(name : string) : string = 
    String.concat("Hello, ", name)

  public function donate() : int =
    Call.value
```

```javascript
let deployer = new Deployer('local', privateKey);
deployedContract = await deployer.deploy( contractPath, []); // empty array for init params

let result = await deployedContract.sayHello('World'); // result would be: "Hello, World"
```

or you can execute/call functions from another private/secret key
```javascript
const fromInstance = await deployedContract.from(anotherSecretKey);
let result = await fromInstance.sayHello('Friend'); // result would be: "Hello, Friend"
```

or you just want to donate some aettos
```javascript
await deployedContract.donate({ value: 991 });
```