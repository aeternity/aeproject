const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const assert = chai.assert;
chai.use(chaiAsPromised);

const path = require('path');
const fs = require('fs');

const Universal = require('@aeternity/aepp-sdk').Universal;
// const Deployer = require('forgae').Deployer;
const Deployer = require('./../../cli-commands/forgae-deploy/forgae-deployer');
const utils = require('./../../cli-commands/utils');

const contractPath = './contracts/example-contract.aes';

const ownerKeyPair = {
    publicKey: "ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU",
    privateKey: "bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca"
};
const notOwnerKeyPair = wallets[8];

const availableSmartContratsFunctions = [
    'sayHello',
    'sum',
    'am_i_caller',
    'get_caller'
];

const unavailableSmartContratsFunctions = [
    'multiply',
    'prv_func'
];

//console.log(wallets);

describe("Deployed contract instance additional functionality", async () => {

    let deployedContract;

        before(async () => {

            // start node 

            let deployer = new Deployer('local', ownerKeyPair.privateKey);
            deployedContract = await deployer.deploy(path.resolve(__dirname, contractPath));
        });

    describe("Test Extract smart contract's functions", async () => {

        it("Are all public functions available in contract's instance", async () => {
            for(functionName of availableSmartContratsFunctions) {
                if (!deployedContract[functionName]) {
                    assert.isOk(false, 'Function is not extracted from smart contract');
                }
            }
        });

        it("Private functions should not be extracted", async () => {
            for(functionName of unavailableSmartContratsFunctions) {
                if (deployedContract[functionName]) {
                    assert.isOk(false, `Function [${functionName}] is extracted from smart contract`);
                }
            }
        });

    });

    describe("Test extracted functions", async () => {

        it("Should execute function that accept 'string' as parameter successfully", async () => {
            let parameter = "Aleks"
            let expectedResult = `Hello ${parameter}`;

            let result = await deployedContract.sayHello(parameter);
		    assert.equal(result, expectedResult, "Result is not expected one.");
        });

        it("Should execute function that accept 'int/ints' as parameter successfully", async () => {
            let firstParam = 4;
            let secondParam = 9;

            let result = await deployedContract.sum(firstParam, secondParam);
		    assert.equal(result, firstParam + secondParam, "Result is not expected one.");
        });

        it("Should execute function that accept 'address' as parameter successfully", async () => {

            let result = await deployedContract.am_i_caller(ownerKeyPair.publicKey);
            assert.equal(result, true, "Passed public key is not an owner!");
            
            result = await deployedContract.am_i_caller(notOwnerKeyPair.publicKey);
		    assert.equal(result, false, "Passed public key is an owner!");
        });

        it("Should execute function that accept 'bool' as parameter successfully", async () => {
            let param = true;

            let result = await deployedContract.show_my_param(param);
            assert.equal(result, param, "Returned value is not as the passed one, should be true");
            
            result = await deployedContract.show_my_param(!param);
		    assert.equal(result, !param, "Returned value is not as the passed one, should be false");
        });

        it("Should execute function without parameter successfully", async () => {
            let result = await deployedContract.get_caller();
            assert.equal(utils.decodedHexAddressToPublicAddress(result), ownerKeyPair.publicKey, "Returned value is not as the passed one, should be true");
        });

        it("Should execute function that accept AND 'amount/aettos' as second parameter", async () => {
            let parameter = "Aleks";
            
            await assert.isFulfilled(deployedContract.sayHello(parameter, { value: 69}), "Function does not executed successfully!")
        });

        // test call function
    });

    describe("Test [from] functionality", async () => {
        let fromInstance;

        before(async () => {

            console.log('owner');
            console.log(ownerKeyPair);
            console.log();
            console.log('not owner');
            console.log(notOwnerKeyPair);

            let network = utils.getNetwork('local');
            // let client = await utils.createLocalAccount(ownerKeyPair);
            let client = await utils.getClient(network, ownerKeyPair);
            
            //fund not owner account
            await client.spend(1000000, notOwnerKeyPair.publicKey);
            // await client.spend(notOwnerKeyPair, 1000000000);

            console.log(991);


            // fromInstance = await deployedContract.from(notOwnerKeyPair.secretKey);
        });

        it.only("Should execute function that accept 'string' as parameter successfully", async () => {
            // let parameter = "George"
            // let expectedResult = `Hello ${parameter}`;

            // let result = await fromInstance.sayHello(parameter);
		    // assert.equal(result, expectedResult, "Result is not expected one.");
        });

        it("Should execute function that accept 'int/ints' as parameter successfully", async () => {
            let firstParam = 14;
            let secondParam = 9;

            let result = await fromInstance.sum(firstParam, secondParam);
		    assert.equal(result, firstParam + secondParam, "Result is not expected one.");
        });

        it("Should execute function that accept 'address' as parameter successfully", async () => {

            let result = await fromInstance.am_i_caller(ownerKeyPair.publicKey);
            assert.equal(result, true, "Passed public key is not an owner!");
            
            result = await fromInstance.am_i_caller(notOwnerKeyPair.publicKey);
		    assert.equal(result, false, "Passed public key is an owner!");
        });

        it("Should execute function that accept 'bool' as parameter successfully", async () => {
            let param = true;

            let result = await fromInstance.show_my_param(param);
            assert.equal(result, param, "Returned value is not as the passed one, should be true");
            
            result = await fromInstance.show_my_param(!param);
		    assert.equal(result, !param, "Returned value is not as the passed one, should be false");
        });

        it("Should execute function without parameter successfully", async () => {
            let result = await fromInstance.get_caller();
            assert.equal(utils.decodedHexAddressToPublicAddress(result), notOwnerKeyPair.publicKey, "Returned value is not as the passed one, should be true");
        });

        it("Should execute function that accept AND 'amount/aettos' as second parameter", async () => {
            let parameter = "George";
            
            await assert.isFulfilled(fromInstance.sayHello(parameter, { value: 69}), "Function does not executed successfully!")
        });
    });

    after(async () => {
        // stop node
    })
});
