# Migration from 2.1 to 3.0

## Breaking Changes

Our team has made some fixes to contracts wrappers and we are now more tight with the ACI's provided by the JS-SDK. We have also upgraded the local compiler to the current latest version of 3.2. Both things lead to breaking changes into Fograe. Here are two easy steps for an ease migration to the latest version.

### Contract Wrappers

Deploying a smart contract via Forgae's deployer provides contract instance with predefined functions and ability to call them **from** another account. To be able to use this with the lastest forgae version you need to do the following changes:

**Smart Contract** 

    contract ExampleContract =
       type state = ()
       function main(x : int) = x

**Version 2.1:**

    const Deployer = require('forgae-lib').Deployer;
    const EXAMPLE_CONTRACT_PATH = "./contracts/ExampleContract.aes";
    
    describe('Example Contract', () => {
    
        let deployer;
        let ownerKeyPair = wallets[0];
    
        before(async () => {
            deployer = new Deployer('local', ownerKeyPair.secretKey)
        })
    
        it('Deploying Example Contract', async () => {
            const contractInstance = await deployer.deploy(EXAMPLE_CONTRACT_PATH) // Deploy it
            let result = await contractInstance.main(5);
            console.log(result) // Result = 5
    
        })
    })

In the current version of forgae (2.1) The result is provided from calling the function without the need of decoding it.

**Version 3.0:**

    const Deployer = require('forgae-lib').Deployer;
    const EXAMPLE_CONTRACT_PATH = "./contracts/ExampleContract.aes";
    
    describe('Example Contract', () => {
    
        let deployer;
        let ownerKeyPair = wallets[0];
    
        before(async () => {
            deployer = new Deployer('local', ownerKeyPair.secretKey)
        })
    
        it('Deploying Example Contract', async () => {
            const contractInstance = await deployer.deploy(EXAMPLE_CONTRACT_PATH) // Deploy it
            let result = await contractInstance.main(5);
            console.log(result.decodedResult)// result.decodedResult = 5
    
        })
    })

In the latests version when calling a function from the contract instance, you must use the **decodedResult** property to get the result. In order you previous calls to work you simply need to add **decodedResult** to the function result.

### Smart Contracts

The sophia compiler version 3.2 and above brings breaking changes in the language. Public functions are now **entrypoints**, and private functions are just **functions.**

**Example Contract for version 3.1 and below:**

    contract ExampleContract =
       type state = ()
       function main(x : int) = x
    	 private function sub(x : int, y: int) = x + y

**Example Contract for version 3.2 and above:**

    contract ExampleContract =
       type state = ()
       entrypoint main(x : int) = x 
       function sub(x : int, y: int) = x + y