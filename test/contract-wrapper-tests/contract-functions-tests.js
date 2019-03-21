const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const assert = chai.assert;
chai.use(chaiAsPromised);

const path = require('path');
const fs = require('fs-extra');

const constants = require('./../constants.json');

const Deployer = require('./../../cli-commands/forgae-deploy/forgae-deployer');
const execute = require('./../../cli-commands/utils').forgaeExecute;
const waitForContainer = require('./../utils').waitForContainer;
const convertToPerson = require('./../utils').convertToPerson;

const contractPath = './contracts/example-contract.aes';

const keyPairs = require('./constants/keyPairs.json');
const ownerKeyPair = keyPairs.owner;
const notOwnerKeyPair = keyPairs.notOwner;

const availableSmartContratsFunctions = [
    'sayHello',
    'sum',
    'am_i_caller',
    'get_caller',
    'add_person',
    'get_person_by_id'
];

const unavailableSmartContratsFunctions = [
    'multiply',
    'prv_func',
    'commented_function',
    '_get_person_by_id'
];

let executeOptions = {
	cwd: process.cwd() + constants.deployTestsFolderPath
};

describe("Deployed contract instance additional functionality", async () => {

    let deployedContract;

    before(async () => {

        // start node 
        fs.ensureDirSync(`.${constants.deployTestsFolderPath}`);
		await execute(constants.cliCommands.INIT, [], executeOptions);
		await execute(constants.cliCommands.NODE, [], executeOptions);

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
            assert.equal(result, ownerKeyPair.publicKey, "Returned value is not as the passed one, should be true");
        });

        it("Should execute function that accept AND 'amount/aettos' as second parameter", async () => {
            let parameter = "Aleks";
            
            await assert.isFulfilled(deployedContract.sayHello(parameter, { value: 169}), "Function does not executed successfully!");
        });

        it("Should execute default [call] function.", async () => {
            let param = `("Im a super hero")`;
            let result = await deployedContract.call('sayHello', { "args": param });
            let value = (await result.decode('string')).value;

            assert.equal(value, `Hello ${param.replace(/[\(\)\")]+/g, '')}`, "Result is incorrect!");
        });

        it("Should execute default [call] function with passed amount/aettos.", async () => {
            let param = `("Im a super hero!")`;
            let result = await deployedContract.call('sayHello', { "args": param, amount: 101 });
		    let value = (await result.decode('string')).value;

            assert.equal(value, `Hello ${param.replace(/[\(\)\")]+/g, '')}`, "Result is incorrect!");
        });

        it('Should add person successfully', async () => {
            await assert.isFulfilled(deployedContract.add_person("Ivan", 25), "Cannot add person successfully!")
        });

        it('Should get person and decode record person successfully', async () => {
            // params
            const NAME = "Ivan";
            const AGE = 25;

            let id = await deployedContract.add_person(NAME, AGE);
            let encodedRecord = await deployedContract.get_person_by_id(id);
            let person = convertToPerson(encodedRecord);

            assert.equal(person.name, NAME, "Incorrect decoded data: 'Name'.")
            assert.equal(person.age, AGE, "Incorrect decoded data: 'Age'.")
        });

        it('Should get empty person', async () => {
            let encodedRecord = await deployedContract.get_person_by_id(91);
            let person = convertToPerson(encodedRecord);

            assert.equal(person.name, "", "Incorrect decoded data: 'Name'.")
            assert.equal(person.age, 0, "Incorrect decoded data: 'Age'.")
        });
    });

    describe("Test [from] functionality", async () => {
        let fromInstance;

        before(async () => {
            fromInstance = await deployedContract.from(notOwnerKeyPair.secretKey);
        });

        it("Should execute function that accept 'string' as parameter successfully", async () => {
            let parameter = "George"
            let expectedResult = `Hello ${parameter}`;

            let result = await fromInstance.sayHello(parameter);
		    assert.equal(result, expectedResult, "Result is not expected one.");
        });

        it("Should execute function that accept 'int/ints' as parameter successfully", async () => {
            let firstParam = 14;
            let secondParam = 9;

            let result = await fromInstance.sum(firstParam, secondParam);
		    assert.equal(result, firstParam + secondParam, "Result is not expected one.");
        });

        it("Should execute function that accept 'address' as parameter successfully", async () => {

            let result = await fromInstance.am_i_caller(ownerKeyPair.publicKey);
            assert.equal(result, false, "Passed public key is an owner!");
            
            result = await fromInstance.am_i_caller(notOwnerKeyPair.publicKey);
		    assert.equal(result, true, "Passed public key is NOT an owner!");
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
            assert.equal(result, notOwnerKeyPair.publicKey, "Returned value is not as the passed one, should be true");
        });

        it("Should execute function that accept AND 'amount/aettos' as second parameter", async () => {
            let parameter = "George";
            
            await assert.isFulfilled(fromInstance.sayHello(parameter, { value: 69}), "Function does not executed successfully!")
        });

        it("Should execute default [call] function.", async () => {
            let param = `("Im a super hero!")`;
            let result = await fromInstance.call('sayHello', { "args": param });
            let value = (await result.decode('string')).value;

            assert.equal(value, `Hello ${param.replace(/[\(\)\")]+/g, '')}`, "Result is incorrect!");
        });

        it("Should execute default [call] function with passed amount/aettos.", async () => {
            let param = `("Im a super hero!")`;
            let result = await fromInstance.call('sayHello', { "args": param, amount: 101 });
		    let value = (await result.decode('string')).value;

            assert.equal(value, `Hello ${param.replace(/[\(\)\")]+/g, '')}`, "Result is incorrect!");
        });

        it('Should add person successfully', async () => {
            await assert.isFulfilled(fromInstance.add_person("Ivan", 25), "Cannot add person successfully!")
        });

        it('Should get person and decode record person successfully', async () => {
            // params
            const NAME = "Ivan";
            const AGE = 25;

            let id = await fromInstance.add_person(NAME, AGE);
            let encodedRecord = await fromInstance.get_person_by_id(id);
            let person = convertToPerson(encodedRecord);

            assert.equal(person.name, NAME, "Incorrect decoded data: 'Name'.")
            assert.equal(person.age, AGE, "Incorrect decoded data: 'Age'.")
        });

        it('Should get empty person', async () => {
            let encodedRecord = await fromInstance.get_person_by_id(91);
            let person = convertToPerson(encodedRecord);

            assert.equal(person.name, "", "Incorrect decoded data: 'Name'.")
            assert.equal(person.age, 0, "Incorrect decoded data: 'Age'.")
        });
    });

    after(async () => {
        // stop node
        let running = await waitForContainer();
		if (running) {
			await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions)
		}

		fs.removeSync(`.${constants.deployTestsFolderPath}`)
    })
});
