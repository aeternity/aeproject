# Quick Start

## Install 
```
npm install -g forgae
```

## Running local node 

```
forgae node
```

## Init a project
```
forgae init
```

This will create `deployment` directory with `deploy.js` file inside. You can use this file to write your deployment procedure.

## Access deployed smart contract functions
You can execute function of smart contract from deployed instance

Examples
```
contract ExampleContract =

  public function say_hello(name : string) : string = 
    String.concat("Hello, ", name)

  public function donate() : int =
    Call.value
```

```javascript
let deployer = new Deployer('local', privateKey);
deployedContract = await deployer.deploy( contractPath, []); // empty array for init params

let result = await deployedContract.say_hello('World'); // result would be: "Hello, World"
```

or you can execute/call functions from another private/secret key
```javascript
const fromInstance = await deployedContract.from(anotherSecretKey);
let result = await fromInstance.say_hello('Friend'); // result would be: "Hello, Friend"
```

or you just want to donate some aettos
```javascript
await deployedContract.donate({ value: 991 });
```

## Deploying

Run the following in order to execute the deployment file created from the **forgae init** command:

```text
forgae deploy
```


## History of your deploys

In order to see a list of what you've deployed you can run the following command:

```text
forgae history
```