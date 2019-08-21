const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const assert = chai.assert;
chai.use(chaiAsPromised);

const path = require('path');
const fs = require('fs-extra');

const constants = require('./../constants.json');

const Deployer = require('./../../packages/aeproject-lib/dist/aeproject-deployer').Deployer;
const execute = require('../../packages/aeproject-utils/utils/aeproject-utils.js').aeprojectExecute;
const waitForContainer = require('../utils').waitForContainer;
const nodeConfig = require('./../../packages/aeproject-config/config/node-config.json');

const contractPath = './contracts/example-contract.aes';

const keyPairs = require('./constants/keyPairs.json');
const ownerKeyPair = keyPairs.owner;
const notOwnerKeyPair = keyPairs.notOwner;

const availableSmartContratsFunctions = [
    'say_hello',
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
    cwd: process.cwd() + constants.contractWrapperTestsFolderPath
};

describe("Deployed contract instance additional functionality", async () => {

    let deployedContract;

    before(async () => {

        // start node 
        fs.ensureDirSync(`.${ constants.contractWrapperTestsFolderPath }`);
        await execute(constants.cliCommands.INIT, [], executeOptions);
        await execute(constants.cliCommands.NODE, [], executeOptions);

        let deployer = new Deployer('local', ownerKeyPair.privateKey);
        deployedContract = await deployer.deploy(path.resolve(__dirname, contractPath));
    });

    describe("Test Extract smart contract's functions", async () => {

        it("Are all public functions available in contract's instance", async () => {
            for (let functionName of availableSmartContratsFunctions) {
                if (!deployedContract[functionName]) {
                    assert.isOk(false, 'Function is not extracted from smart contract');

                }
            }
        });

        it("Private functions should not be extracted", async () => {
            for (let functionName of unavailableSmartContratsFunctions) {
                if (deployedContract[functionName]) {
                    assert.isOk(false, `Function [${ functionName }] is extracted from smart contract`);
                }
            }
        });

    });

    describe("Test extracted functions", async () => {

        it("Should execute function that accept 'string' as parameter successfully", async () => {
            let parameter = "Aleks"
            let expectedResult = `Hello ${ parameter }`;

            let result = await deployedContract.say_hello(parameter);

            assert.equal(result.decodedResult, expectedResult, "Result is not expected one.");
        });

        it("Should execute function that accept 'int/ints' as parameter successfully", async () => {
            let firstParam = 4;
            let secondParam = 9;

            let result = await deployedContract.sum(firstParam, secondParam);
            assert.equal(result.decodedResult, firstParam + secondParam, "Result is not expected one.");
        });

        it("Should execute function that accept 'address' as parameter successfully", async () => {

            let result = await deployedContract.am_i_caller(ownerKeyPair.publicKey);
            assert.equal(result.decodedResult, true, "Passed public key is not an owner!");

            result = await deployedContract.am_i_caller(notOwnerKeyPair.publicKey);
            assert.equal(result.decodedResult, false, "Passed public key is an owner!");
        });

        it("Should execute function that accept 'bool' as parameter successfully", async () => {
            let param = true;

            let result = await deployedContract.show_my_param(param);
            assert.equal(result.decodedResult, param, "Returned value is not as the passed one, should be true");

            result = await deployedContract.show_my_param(!param);
            assert.equal(result.decodedResult, !param, "Returned value is not as the passed one, should be false");
        });

        it("Should execute function without parameter successfully", async () => {
            let result = await deployedContract.get_caller();
            assert.equal(result.decodedResult, ownerKeyPair.publicKey, "Returned value is not as the passed one, should be true");
        });

        it("Should execute function that accept AND 'amount/aettos' as second parameter", async () => {
            let parameter = 'Aleks';

            await assert.isFulfilled(deployedContract.say_hello(parameter, {
                value: 169
            }), "Function does not executed successfully!");
        });

        xit("Should execute default [call] function.", async () => {
            let param = [5, 3];
            let result = await deployedContract.call('sum', param);
            let value = await result.decode();

            assert.equal(value, 8, "Result is incorrect!");
        });

        xit("Should execute default [call] function with passed amount/aettos.", async () => {

            let param = ['Im a super hero!'];
            let result = await deployedContract.call('say_hello', param, {
                amount: 101
            });

            let value = await result.decode();

            assert.equal(value, `Hello ${ param[0].replace(/[\(\)\")]+/g, '') }`, "Result is incorrect!");
        });

        it('Should add person successfully', async () => {
            await assert.isFulfilled(deployedContract.add_person("Ivan", 25), "Cannot add person successfully!")
        });

        it('Should get person and decode record person successfully', async () => {
            // params
            const NAME = "Ivan";
            const AGE = 25;

            let idResult = await deployedContract.add_person(NAME, AGE);
            let encodedRecord = await deployedContract.get_person_by_id(idResult.decodedResult);
            assert.equal(encodedRecord.decodedResult.name, NAME, "Incorrect decoded data: 'Name'.")
            assert.equal(encodedRecord.decodedResult.age, AGE, "Incorrect decoded data: 'Age'.")
        });

        it('Should get empty person', async () => {
            let encodedRecord = await deployedContract.get_person_by_id(91);

            assert.equal(encodedRecord.decodedResult.name, "", "Incorrect decoded data: 'Name'.")
            assert.equal(encodedRecord.decodedResult.age, 0, "Incorrect decoded data: 'Age'.")
        });

        it("Should call function without return type without errors", async () => {
            await assert.isFulfilled(deployedContract.func_no_return(20, 25), "Cannot call function withoud return type!")

        })

        it("Should call function with map as argument without errors", async () => {

            let human = new Map();
            human.set(42, 42);
            let addHumanResult = await deployedContract.add_human(human);

            assert.equal(addHumanResult.decodedResult[0][0], human.get(42), 'The map was not set properly')
        })

        it("Should call function with record aas an argument without errors", async () => {

            let human = {
                name: "Alice",
                age: 25
            }
            let addRecordResult = await deployedContract.add_record(human, 42);

            assert.equal(addRecordResult.decodedResult.name, human.name, "The record was not set properly, names are not equal")
            assert.equal(addRecordResult.decodedResult.age, human.age, "The record was not ser properly, ages are not equal")
        })

        it("Should call function with list as an agrument withoud errors", async () => {

            let humanIds = [1, 2, 3]
            let addListResult = await deployedContract.add_list_human(humanIds);

            assert.equal(addListResult.decodedResult.length, humanIds.length, "Error when calling and setting functions with list arguments")
        })
    });

    describe("Test [from] functionality", async () => {
        let fromInstance;

        before(async () => {
            fromInstance = await deployedContract.from(notOwnerKeyPair.secretKey);
        });

        it("Should execute function that accept 'string' as parameter successfully", async () => {
            let parameter = "George"
            let expectedResult = `Hello ${ parameter }`;

            let result = await fromInstance.say_hello(parameter);
            assert.equal(result.decodedResult, expectedResult, "Result is not expected one.");
        });

        it("should create instance from wallet object", async () => {
            let fromInstancePromise = deployedContract.from(notOwnerKeyPair);
            await assert.isFulfilled(fromInstancePromise, "Error while creating an instance with wallet");

        })

        it("Should execute function that accept 'int/ints' as parameter successfully", async () => {
            let firstParam = 14;
            let secondParam = 9;

            let result = await fromInstance.sum(firstParam, secondParam);
            assert.equal(result.decodedResult, firstParam + secondParam, "Result is not expected one.");
        });

        it("Should execute function that accept 'address' as parameter successfully", async () => {

            let result = await fromInstance.am_i_caller(ownerKeyPair.publicKey);
            assert.equal(result.decodedResult, false, "Passed public key is an owner!");

            result = await fromInstance.am_i_caller(notOwnerKeyPair.publicKey);
            assert.equal(result.decodedResult, true, "Passed public key is NOT an owner!");
        });

        it("Should execute function that accept 'bool' as parameter successfully", async () => {
            let param = true;

            let result = await fromInstance.show_my_param(param);
            assert.equal(result.decodedResult, param, "Returned value is not as the passed one, should be true");

            result = await fromInstance.show_my_param(!param);
            assert.equal(result.decodedResult, !param, "Returned value is not as the passed one, should be false");
        });

        it("Should execute function without parameter successfully", async () => {
            let result = await fromInstance.get_caller();
            assert.equal(result.decodedResult, notOwnerKeyPair.publicKey, "Returned value is not as the passed one, should be true");
        });

        it("Should execute function that accept AND 'amount/aettos' as second parameter", async () => {
            let parameter = "George";

            await assert.isFulfilled(fromInstance.say_hello(parameter, {
                value: 69,
                ttl: 991
            }), "Function does not executed successfully!")
        });

        xit("Should execute default [call] function.", async () => {
            let params = [`"Im a super hero!"`];
            let result = await fromInstance.call('say_hello', params);

            let value = (await result.decode('string'));

            assert.equal(value, `Hello ${ params[0].replace(/[\(\)\")]+/g, '') }`, "Result is incorrect!");
        });

        xit("Should execute default [call] function with passed amount/aettos.", async () => {
            let params = ['1', '5'];
            let options = {
                amount: 101
            };

            let result = await fromInstance.call('sum', params, options);
            let value = (await result.decode('int'));
            assert.equal(value, 6, "Result is incorrect!");
        });

        it('Should add person successfully', async () => {
            await assert.isFulfilled(fromInstance.add_person("Ivan", 25), "Cannot add person successfully!")
        });

        it('Should get person and decode record person successfully', async () => {
            // params
            const NAME = "Ivan";
            const AGE = 25;

            let idResult = await fromInstance.add_person(NAME, AGE);
            let person = await fromInstance.get_person_by_id(idResult.decodedResult);

            assert.equal(person.decodedResult.name, NAME, "Incorrect decoded data: 'Name'.")
            assert.equal(person.decodedResult.age, AGE, "Incorrect decoded data: 'Age'.")
        });

        it('Should get empty person', async () => {
            let person = await fromInstance.get_person_by_id(91);
            assert.equal(person.decodedResult.name, '', "Incorrect decoded data: 'Name'.")
            assert.equal(person.decodedResult.age, 0, "Incorrect decoded data: 'Age'.")
        });

        it("Should call function without return type without errors", async () => {
            await assert.isFulfilled(fromInstance.func_no_return(20, 25), "Cannot call function withoud return type!")

        })

        it("Should call function with map as argument without errors", async () => {

            let human = new Map();
            human.set(42, 42);
            let addHumanResult = await fromInstance.add_human(human);

            assert.equal(addHumanResult.decodedResult[0][0], human.get(42), 'The map was not set properly')
        })

        it("Should call function with record aas an argument without errors", async () => {

            let human = {
                name: "Alice",
                age: 25
            }
            let addRecordResult = await fromInstance.add_record(human, 42);

            assert.equal(addRecordResult.decodedResult.name, human.name, "The record was not set properly, names are not equal")
            assert.equal(addRecordResult.decodedResult.age, human.age, "The record was not ser properly, ages are not equal")
        })

        it("Should call function with list as an agrument withoud errors", async () => {

            let humanIds = [1, 2, 3]
            let addListResult = await fromInstance.add_list_human(humanIds);

            assert.equal(addListResult.decodedResult.length, humanIds.length, "Error when calling and setting functions with list arguments")
        })
    });

    after(async () => {
        // stop node
        let running = await waitForContainer(nodeConfig.nodeConfiguration.dockerServiceNodeName, executeOptions);
        if (running) {
            await execute(constants.cliCommands.NODE, [constants.cliCommandsOptions.STOP], executeOptions);
        }

        fs.removeSync(`.${ constants.contractWrapperTestsFolderPath }`)
    })
});