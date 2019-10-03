const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const assert = chai.assert;
chai.use(chaiAsPromised);

const path = require('path');
const fs = require('fs');

const SophiaUtil = require('./../../packages/aeproject-utils/utils/sophia-util');

const sophiaContractPath = './../commands-tests/artifacts/calculator.aes';
const invalidContractNameSophiaContractPath = './../commands-tests/artifacts/calculator-invalid-name.aes';

const sophiaTestsPath = './../commands-tests/artifacts/calculator-tests.aes';
const invalidContractNameSophiaTestsPath = './../commands-tests/artifacts/calculator-tests-invalid-contract-name.aes';

const countPhraseRepeats = require('./../utils').countPhraseRepeats;

const VALID_TEST_FUNCTIONS = [
    'test_sum_correct',
    'test_sum_incorrect'
];

const INVALID_TEST_FUNCTIONS = [
    'should_not_call_me',
    'i_am_private',
    'require',
    'commented_should_not_call',
    'commented_am_i_private'
];

describe('Sophia util tests', async () => {

    it('Should parse only one smart contract', async () => {
        const contractName = 'Calculator';

        let contractInfoMap = SophiaUtil.getContractInfo(path.resolve(__dirname, sophiaContractPath));

        for (let key of contractInfoMap.keys()) {
            assert.equal(key, contractName, "There is more than one parsed contract!");
        }
    });

    it('Should parse smart contract info', async () => {
        const contractName = 'Calculator';

        let contractInfoMap = SophiaUtil.getContractInfo(path.resolve(__dirname, sophiaContractPath));
        // console.log(contractInfoMap);

        assert.isOk(contractInfoMap.has(contractName), "Should contain smart contract name as a key.")

        let calculatorInfo = contractInfoMap.get(contractName);
        // console.log(calculatorInfo);

        assert.equal(calculatorInfo.contractName, contractName, "Contract name does not match!");
        assert.equal(calculatorInfo.testFunctions, 0, "Contract source should not have 'test' functions");
    });

    it(`Should parse valid sophia tests(function's names)`, async () => {
        const contractName = 'Calculator';

        let contractInfoMap = SophiaUtil.getContractInfo(path.resolve(__dirname, sophiaTestsPath));
        let calculatorInfo = contractInfoMap.get(contractName);

        for (let functionName of calculatorInfo.testFunctions) {
            assert.isOk(VALID_TEST_FUNCTIONS.includes(functionName), `This [${ functionName }] should not be parsed!`);
        }
    });

    it(`Should NOT parse invalid sophia tests(function's names)`, async () => {
        const contractName = 'Calculator';

        let contractInfoMap = SophiaUtil.getContractInfo(path.resolve(__dirname, sophiaTestsPath));
        let calculatorInfo = contractInfoMap.get(contractName);

        for (let functionName of calculatorInfo.testFunctions) {
            assert.isNotOk(INVALID_TEST_FUNCTIONS.includes(functionName), `This [${ functionName }] should be parsed!`);
        }
    });

    it(`Should get contract's names`, async () => {
        const contractName = 'Calculator';

        let contractInfoMap = SophiaUtil.getContractInfo(path.resolve(__dirname, sophiaTestsPath));
        let calculatorInfo = contractInfoMap.get(contractName);
        assert.equal(calculatorInfo.contractName, contractName);

        contractInfoMap = SophiaUtil.getContractInfo(path.resolve(__dirname, sophiaContractPath));
        calculatorInfo = contractInfoMap.get(contractName);
        assert.equal(calculatorInfo.contractName, contractName);

        contractInfoMap = SophiaUtil.getContractInfo(path.resolve(__dirname, invalidContractNameSophiaContractPath));
        calculatorInfo = contractInfoMap.get('SomeContract');
        assert.equal(calculatorInfo.contractName, 'SomeContract');

        contractInfoMap = SophiaUtil.getContractInfo(path.resolve(__dirname, invalidContractNameSophiaTestsPath));
        calculatorInfo = contractInfoMap.get('Ownable');
        assert.equal(calculatorInfo.contractName, 'Ownable');
    });

    it(`Merged file (contract and tests) should contain each function once`, async () => {

        const calculatorSmartContractSource = fs.readFileSync(path.resolve(__dirname, sophiaContractPath), 'utf8');
        const calculatorTestsSource = fs.readFileSync(path.resolve(__dirname, sophiaTestsPath), 'utf8');

        let fullExample = SophiaUtil.generateCompleteSource(calculatorSmartContractSource, calculatorTestsSource);

        assert.equal(countPhraseRepeats(fullExample, 'contract Calculator ='), 1, "'Contract' repeats more than once!");

        const allFunctions = VALID_TEST_FUNCTIONS.concat(INVALID_TEST_FUNCTIONS);
        for (let func of allFunctions) {
            if (func === "i_am_private") {
                assert.equal(countPhraseRepeats(fullExample, func), 3, `Function ${ func } repeats more than once!`);
                return
            }
            assert.equal(countPhraseRepeats(fullExample, func), 1, `Function ${ func } repeats more than once!`);
        }
    });
})