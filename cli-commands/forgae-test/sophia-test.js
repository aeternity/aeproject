const fs = require('fs');
const jsTests = require('./forgae-test');
const utils = require('./../utils');
const deleteCreatedFiles = utils.deleteCreatedFiles;

const SophiaUtil = require('./../../utils/SophiaUtil')

function generateIt (testFunctions) {
    let its = '';

    for (let testFunc of testFunctions) {
        its += `
            it('test - ${ testFunc }', async () => {
                await assert.isFulfilled(contractInstance.call("${ testFunc }"));
            })\n
        `;
    }

    return its;
}

const run = async function (paths) {

    const testFolder = process.cwd() + '/test';

    // console.log('cwd', process.cwd());

    const contractsFolder = `${ process.cwd() }/contracts/`;
    const sophiaContractPaths = await utils.getFiles(contractsFolder, `.aes$`);

    const mainContractsInfo = SophiaUtil.getContractInfo(sophiaContractPaths);
    const contractsTest = SophiaUtil.getContractInfo(paths);

    const testFiles = [];

    for (let contract of contractsTest.values()) {
        if (!mainContractsInfo.has(contract.contractName)) {
            throw new Error(`Contract "${ contract.contractName }" was not found!`);
        }

        const path = contract.path;
        const testFunctions = contract.testFunctions; // ['test_sum_correct', 'test_sum_incorrect'];
        const source = SophiaUtil.generateCompleteSource(mainContractsInfo.get(contract.contractName).source, contract.source);

        let testFile = `
            const path = require('path');
            const chai = require('chai');
            let chaiAsPromised = require("chai-as-promised");
            chai.use(chaiAsPromised);
            const assert = chai.assert;

            const AeSDK = require('@aeternity/aepp-sdk');
            const Universal = AeSDK.Universal;
            const config = require('./config.json');

            const utils = require('./utils');
            const getClient = utils.getAEClient;

            const contractFilePath = "${ path }";
            const contractSource = \`${ source }\`

            describe('test', async () => {

                let contractInstance;
                
                beforeEach(async () => {
                    let client = await getClient(Universal, config, config.ownerKeyPair);
                    contractInstance = await client.getContractInstance(contractSource);
                    await contractInstance.deploy([]);
                })

                ${ generateIt(testFunctions) }
            })
        `;

        let testFilePath = `${ testFolder }/sophia-test-${ contract.contractName }.js`;
        testFiles.push(testFilePath);
        fs.appendFileSync(testFilePath, testFile, 'utf8');
    }

    // run regular js tests
    await jsTests.run(testFiles);

    // delete created tests
    deleteCreatedFiles(testFiles);
}

module.exports = {
    run
};