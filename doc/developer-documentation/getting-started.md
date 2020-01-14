# Quick Start

## Requirements
In order to have aeproject working you must have installed the following:
```
nodejs 9.5.0 (if you are willing to use the *fire-editor* aepp locally with *aeproject* you would need to use version not lower to 10.9.0. For more information check [aeproject fire-editor](developer-documentation/aeproject-cli/fire-editor.md))
python 
docker 
```

**Note:** For older versions on widnows you can use docker-toolbox. This will install docker-compose as part of the toolkit. Please bear in mind that the your docker-compose version must be at least @**1.20.0** <i>
## Install

```text
npm install -g aeproject
```

## Init a project

```text
aeproject init
```

This will create `deployment` directory with `deploy.js` file inside. You can use this file to write your deployment procedure.

## Running local node
In a project folder:
```text
aeproject node
```

To stop already spawned local node use `aeproject node --stop`

## Access deployed smart contract functions

You can execute function of smart contract from deployed instance

Examples

```text
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

Run the following in order to execute the deployment file created from the **aeproject init** command:

```text
aeproject deploy
```

## History of your deploys

In order to see a list of what you've deployed you can run the following command:

```text
aeproject history
```

