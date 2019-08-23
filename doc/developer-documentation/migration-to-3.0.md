# Migratе Forgae from 2.1 to 3.0

## Breaking Changes

Our team has made some fixes to contracts wrappers and we are now more tight with the ACI's provided by the JS-SDK. We have also upgraded the local compiler to the current latest version of 3.2. Both things lead to breaking changes into Fograe. Here are two steps for an easy migration to the latest version.

### Contract Wrappers

Deploying a smart contract via AEproject's deployer returns contract instance with predefined functions and ability to call them **from** another account. 

In the latest version when calling a function from the contract instance, you must use the **decodedResult** property to get the result. In order for your previous calls to work you simply need to use the **decodedResult** property of the transaction execution result.

 ****

**Example Smart Contract**

    contract ExampleContract =
       type state = ()
       function main(x : int) = x

**Version 2.1 :**

*This is an example from the unit tests* ****

    const Deployer = require('aeproject-lib').Deployer;
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

In the current version of aeproject (2.1) The result is provided from calling the function without the need of decoding it.

**Version 3.0:**

*This is an example from the unit tests* ****

    const Deployer = require('aeproject-lib').Deployer;
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

### Smart Contracts

The sophia compiler version 3.2 and above brings breaking changes in the language. Public functions are now called **entrypoints**, and private functions are just **functions.**

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