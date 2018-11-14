const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const assert = chai.assert;
const execute = require('../../utils.js').execute;
const fs = require('fs-extra')
const constants = require('../constants.json')
const expectedCompileResult = "cb_8TfnaSmi7HKCLz4oeoMuyPzGoWbCWMGHKcokE815juzWq8L15xENS435GHB1sYMLkBMee5n9xVUKokfsDqqhdhekX6dFn2Xi7uQ9wGaQ5F92osUnPbfJhKpsjEKSdc44CucTJciKAGUBoZDqtPma6GbtnyC2y1scMJHV3rjvtz3qjCeSiryd8LiKZpdkhKa6V6x51rv9b57CLFLSTiLJQFPAfSwJmTgavoJJJRBmcfVYMDqfwA7gQwiQSM3481YbpZMXqQQCvaufVGDDNT9khvn8wTR1ynsmceNh1vY4H8isUQ6njou4X1mhPHoaMWiw61kHWGkanasbv7NpYrT2P6FZFqbRfm5jPzocrspSaWacXPfDp8XXv9LGoQ4wsZPWjdu26e5kHohnuCRxWb9csGjpfVB3ZXUG65XEiEDYXzvkFW4Z8DVx9S3zpU57fuWRpdphbrt4LxfzWqmLSNUpcSwjpZX8Q4jiNj6N6bU23FddzsLgHapAss3i4KYD184XXAze4KUSqyT1818UfEJB8M7LeYzcZetoFvfVN8aPHdSsLiuEUJu1zXyzTmSEGrP5d1p26AV7b"
const expectedCompileResultExampleContract = "cb_PrYsBBtiqaRZTzdeE1FbEWtNbf1rhKSuSxmfVTeFyjeb4Qry2t5YG2RR4PF1jwQVbsqQw1dNoh9RxxdDznxMVGk37jG9pC5s3WMNuBzyzDRSJfpmbB9dtSN6zBj6HRBGAMEpFxgVJKA4sfjUvKSQSLquKVLyBi3M48AdPuP1h5RumtYApFwfc8wBtrM91LUb8kPT9Tybb9JGagAM29WSHQG9tYP1iQmyirXEYG67528mwxrbhmWkd9masV7R4wDzF8B2tzry4rkM5Duj2qQ7vi7A6eErVzxnNJKUwsmXtfX4FazsavfNbm4MMFEtT3sLsySe6gp6T9ugNTp19GCwWRpsytdEyfoAg1ntFZWtUToKHYo2pq8v7L7jA1nAo28D8T7uZen6FXUPHbXipRBaKk5Ag5cQ6fTpq6iiSpuhzxK3CPCWhoRAfF1JPd449oydEHhiadzyQRK5zfBBPZnQH2uoeJvLuwB1FRJB6ojHpXy637S7oaznVUuAtqZghoD1nNn1RRDE5bXQ9aujqfPZXejKc9amWjCnbCdCUqUcPfZ23hinabELnpCq6oFLsDtxYnb82u4yjrzWoFjeqML69ETBYWqiGa7oQRs6XmojetacYLVMcMTJAoPMLdZee7rkSAE6caF1EpgxMg6Wf4cKpHvz28KWTjwERKuwMFyhSSKPe7tiR8Q7TabB7wxPLiX3DpsZLRmMBue9d6N6LhW74mrpnPYtranjLR8eaSzNBzXXsnjGf8XoBw6GEhMCBvUZBtGtqgfAEyzR81RKWhhBg9mRPWzPntjZAPpH1PYF5qsNonbn6qKeJhyBPiiKEhatYiq5DnujgtnP1pMV2hR7jf1DhM69yo22XEScLxNkeVL6xMsmvYP7f88RyXmtYhkW4V3zw4AnZwZA9vygWb4rus3eTsGRGH8pbc4gHVMSz6skJiaRp7MHT5hNVTr7a2576jm7MHh8HvFVoyxUGa33VxLD2KVZ8D1A1CSB6sc6dETfUNXVjN8UKr8qBnzEm5ueue94VtW7zTanP5dRZPDSwfRVbNQrLgLpF9Gw3x5zmT89igb5vdndeh5vbdG8CPwbdUMA9iWDDugZrAm8AY98pnubTxtQKAkRne9Ntjw1sdZDxci5UrsM2ov2agWNAWe2AP9D9q17UThrN6A9erRT6GwJNpLxFYd3wws5k9RYzRxqFBxo1RC8RCYpNCqvd8jm1Eyfa18mehanSx4xwjPv1pqxxaeRLGLBAKD5zfax9Rzzhdc64LVG5auA8nxybrngty8vRWhv1DGkciwezmvktVTqa46a4Ww7gb6aGX8fDPUhn5A5x5eddEXyaK3u64V1kJ3gNnJs5eBMnyBENZGncUT9NkuRDp7MgWFa4R4VB"

let expectedResult1 = "ExampleContract1.aes has been successfully compiled"
let expectedResult2 = "ExampleContract2.aes has been successfully compiled"
let expectedResult3 = "ExampleContract3.aes has been successfully compiled"
let executeOptions = {
	cwd: process.cwd() + constants.compileTestsFolderPath
};
chai.use(chaiAsPromised);

describe('Aeproject Compile', () => {
	before(async () => {

		fs.ensureDirSync(`.${constants.compileTestsFolderPath}`)
		await execute(constants.cliCommands.INIT, [], executeOptions)
		await execute(constants.cliCommands.EPOCH, [], executeOptions)
	})

	describe('Compile', () => {
		it('Should compile contract successfully with specif contract path', async () => {
			let result = await execute(constants.cliCommands.COMPILE, [constants.cliCommandsOptions.PATH, `${executeOptions.cwd}/contracts/ExampleContract.aes`])
			assert.include(result, expectedCompileResultExampleContract)
		})

		it('Should compile contract successfully without path', async () => {
			let result = await execute(constants.cliCommands.COMPILE, [], executeOptions)
			assert.include(result, expectedCompileResultExampleContract)
		})

		it('Should compile multiple contracts successfully with path', async () => {
			let result = await execute(constants.cliCommands.COMPILE, [constants.cliCommandsOptions.PATH, "../multipleContractsFolder"], executeOptions)
			assert.include(result, expectedResult1)
			assert.include(result, expectedResult2)
			assert.include(result, expectedResult3)
		})
	})

	after(async () => {
		await execute(constants.cliCommands.EPOCH, [constants.cliCommandsOptions.STOP], executeOptions)
		fs.removeSync(`.${constants.compileTestsFolderPath}`);
	})
})