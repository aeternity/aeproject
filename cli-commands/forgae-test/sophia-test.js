const fs = require('fs');
const jsTests = require('./forgae-test');
const utils = require('./../utils');
const timeout = utils.timeout;
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

const run = async function (paths = [], testFolder = process.cwd()) {

    if (paths.length === 0) {
        console.log('There is no sophia test to execute.');
        console.log(paths);
        return;
    }


    const contractsFolder = `${ testFolder }/contracts/`;
    const sophiaContractPaths = await utils.getFiles(contractsFolder.replace('//', '/'), `.aes$`);

    const mainContractsInfo = SophiaUtil.getContractInfo(sophiaContractPaths);

    const contractsTest = SophiaUtil.getContractInfo(paths);

    const testFiles = [];

    for (let contract of contractsTest.values()) {

        if (!mainContractsInfo.has(contract.contractName)) {
            throw new Error(`Contract "${ contract.contractName }" was not found!`);
        }

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
            const config = {
                host: "http://localhost:3001/",
                internalHost: "http://localhost:3001/internal/",
                gas: 200000,
                ttl: 55,
                compilerUrl: 'http://localhost:3080',
                ownerKeyPair: wallets[0]
            }

            const getClient = async function (Universal, clientConfig, keyPair) {
                let client = await Universal({
                    url: clientConfig.host,
                    internalUrl: clientConfig.internalHost,
                    keypair: keyPair,
                    nativeMode: true,
                    networkId: "ae_devnet",
                    compilerUrl: config.compilerUrl
                });
            
                return client;
            }

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

        let testFilePath = `${ testFolder }/test/sophia-test-${ contract.contractName }.js`;
        testFiles.push(testFilePath);
        fs.writeFileSync(testFilePath, testFile, 'utf8');
    }

    let result = await jsTests.run(testFiles);

    //await timeout(30000);
    console.log('6. result');
    console.log(result);
    // delete created tests
    deleteCreatedFiles(testFiles);
}

module.exports = {
    run
};