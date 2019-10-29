const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
chai.use(chaiFiles);

const aeprojectExecute = require('../../packages/aeproject-utils/utils/aeproject-utils.js').aeprojectExecute;
const fs = require('fs-extra');
const path = require('path');

const aeprojectConfigDefaultFileName = require('./../../packages/aeproject-cli/aeproject-export/constants').aeprojectConfigFileName;
const constants = require('../constants.json');

// spend tx tx_+E0MAaEBK4bq9XiZ/0QVdOa8Hs9V18v6dGZYIa8XXNYFpQh6yq6hAR8To7CL8AFABmKmi2nYdfeAPOxMCGR/btXYTHiXvVCjCoJOIAABgL6cZFo=

// create contract tx: tx_+PoLAfhCuECRdwTeaI2onxi0YH/64dl8qdlLzxddWJTdmgLmejN/kqsuv0YDRz5MwOCLQSHbqDI2pyqNtLIzQjO7XvZG5NoLuLL4sCoBoQEqoOAY8jBHCYKJ+xLgPYzkjc9RvfL56vnz/NLMSAC/BgG4aPhmRgOgC9n+d1XXo09rOw+lF4cYysPjtu1w2JxHzo11ummbU9TAuDme/kTWRB8ANwA3ABoOgj8BAz/+uBd+7AA3AQcHAQEAli8CEUTWRB8RaW5pdBG4F37sEW1haW6CLwCFNC4wLjAAgwUAA4ZHcyzkwACCKLEAAIMYF/iEO5rKAIcrEUTWRB8/0P+Jmw==
// tx_+PoLAfhCuEAB3cmbG8P/MG3lxFYRcSAqneX66tGWLpbP1U+7V4Q6+ZsGGcJRikW/nBfk3HlbiQ4mVIuiJqHtlcAe/GhTpyEMuLL4sCoBoQHpu/YE5hG1Rgo7OZnpdxtvYEF9c858VRnhL34SehIlygu4aPhmRgOgC9n+d1XXo09rOw+lF4cYysPjtu1w2JxHzo11ummbU9TAuDme/kTWRB8ANwA3ABoOgj8BAz/+uBd+7AA3AQcHAQEAli8CEUTWRB8RaW5pdBG4F37sEW1haW6CLwCFNC4wLjAAgwUAA4ZHcyzkwACCGvYAAIMYF/iEO5rKAIcrEUTWRB8/oWDV4g==

// contract call tx
// tx_+QFpCwH4QrhADdLEBzB9yxB+owNtaD4IsrNbV2FhLRSc3PDwfYlnZEafkbhUDHSMC17v7pNqPAHxmY6td3XzR3M+JRMN9/eBBbkBIPkBHSsBoQHpu/YE5hG1Rgo7OZnpdxtvYEF9c858VRnhL34SehIlyhihBZ1Jcpl4ENMAGowV2kXcHPlcrJFui6aAG2icGOwjAyV3AYcBnoLk5yAAAACDGBf4hDuaygC4wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgzCMc7daFfOIBnzwtkVVGQYINX6CnB9GXpGeGBrsUdgoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZUYXNrIEEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJ28j38=

/*
1. test with local network
2. test with testnet
3. test with mainnet

- pass tx of type spend
- pass tx of type contract create
- pass tx of type contract call 

-- is there tx info
-- are any error messages

*/
describe('Transaction inspector tests', async function () {
    before(async function () {

    })

    it('test name', async function () {

    })

    after(async function () {
        
    })
})