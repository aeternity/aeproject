const fs = require('fs');
const jsTests = require('./aeproject-test');
const utils = require('aeproject-utils');
const timeout = utils.timeout;

const deleteCreatedFiles = utils.deleteCreatedFiles;
const SophiaUtil = require('aeproject-utils').SophiaUtil;

function generateIt (testFunctions) {
    let its = '';

    for (let testFunc of testFunctions) {

        its += `
            it('Sophia tests - ${ testFunc }', async () => {
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

    if (!fs.existsSync(contractsFolder)) {
        console.log('There is no sophia test to execute.');
        console.log(`There is missing 'contract' folder at a given test folder: '${ testFolder }'`);
        return;
    }

    const sophiaContractPaths = await utils.getFiles(contractsFolder.replace('//', '/'), `.aes$`);

    const mainContractsInfo = SophiaUtil.getContractInfo(sophiaContractPaths);
    const contractsTest = SophiaUtil.getContractInfo(paths);

    const testFiles = [];

    for (let contract of contractsTest.values()) {
        if (!mainContractsInfo.has(contract.contractName)) {
            const errorMessage = `Cannot append sophia tests to existing contract! Contract "${ contract.contractName }" was not found!`;
            // somehow this error was not thrown in the tests, that why I use console.log.
            console.log(errorMessage);
            throw new Error(errorMessage);
        }
        const testFunctions = contract.testFunctions;
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

            describe('Sophia tests', async () => {

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

    await jsTests.run(testFiles);

    // delete created tests
    deleteCreatedFiles(testFiles);
}

module.exports = {
    run
};