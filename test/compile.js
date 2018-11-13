const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const assert = chai.assert;
const execute = require('./../utils.js').execute;
const cleanUp = require("./utils").cleanUp
const expectedCompileResult = "cb_PrYsBBtiupHWP68rpuqQBQqt4fw66MhdfydeuGFAp6JxYfDLwQjUNRM8Q8A4Pg1ak7yEhBfXFGytCCULXvtdPkMF1nr4Fjhg31uiA3EwWmEn16bWwtu5zKD46ywouUgFkFNbXX8xGsH3t2RzHj63DMA3VC7UvtR6aaTJXAHo5jhUy49q9GVLAJC76iUTXwd3Zg7MHj3NjfdckHmc24PyPkAgenzpiywNwnAJQP6PExyf4shM1hjj9LqyrA1GMtEsrY3k5xso2M1ncFQADn64Ego5GdrWaAPTbLHFNJKf6rG7xopaHUgGKXRsinA2ZtUKstQ2BkthekUSQ9wq52cJwFt9bWWSxxiMHr46tiyMZE6NQDKmq2J8Cci27b1JwtDnsARU1NzGRXZVwRcS7VMV9v4vWUgddAd6jYxSqWo9gdCeZqSAcEWyXcj1X4Sie7buvzi59EmcoigettL5jwjZuBxqZ6vrAWk4aJnubAEW7HVWGftqqPsLzyEDFz1SxdvuaAXkaXyMA6GiksDkLf2w5DVtxsErqzLoGpUYL7jdpbdXMMVfCkdW6gEsLAbTo44ihHcEdMqKCTCZPtL9Ra1SuRfvXd9Y7zTTuphBgCMTjFiyfK4zbfCt7zui5v3LH66XuZz5f9Tm9WQzmfbjYq9CxENexubNh4hFTrBD9yeKzEkXM6CKkWfaTWcBmpnGGMZTu9N92tq5P7T7ikNKBZGZihU3n8gB26xMWaQzpcYPb8Zvf47LTKCZbPxkG9Ed98dq75K6M5HZZ7j8CknmvxHg4LE5Acx5H12oBgbzrKE8ybBK59AzGmWwHSfnKbKQQMsbn5gpUvXLhdGmbru8M8W7umRaTUHhYb3FpTJzJvX1RqckMM6iESLnUY8megTiiYB49PMLmNzYBPALAEN8F7y6Mb4fvu6y5S3G6M848t19Paag2PzWueBE297AGoK5bhbujUfELgMLFy1MPEK2kttKhZtR71oTDURw7wC5wfxEiSnDvumQuMsa6ypCk6dyGL4aK9TsXNiG8L6JgmoLJK1gpoufp9RSVmdd4F6QCTEAVg6LJkb4xPGaGzf7VnyeuJ871o89rNoqDK5mUPMN25V29T5Es7DDPZ3c8dz3vWitzHA2xQDN6psLxE4bxszC6wCJM3wRjKnwtdm3KrExdboP32m6rZVyxhgdZjCCoTeuUmcAGedouPa7EERt6DCASyV62Kz6RKYZbZb3A2PpDQRMbgvJqWPyMLnciAcEZ1X1xs4ACqkfmfGV5NZKashW3x1xrqsrqtgwifvthYSqukitDirzkzjtsnCKzdSrmhGmE9Pqa6SrDUjiNqvBcymU2CYpUYySqKEVoc4EcULXMfpxTPG38sXRRVs81MCZLwBNp"

let expectedResult1 = "Identity.1.aes has been successfully compiled"
let expectedResult2 = "Identity.2.aes has been successfully compiled"
let expectedResult3 = "Identity.3.aes has been successfully compiled"
let executeOptions = { cwd : process.cwd() + "/test"};
chai.use(chaiAsPromised);

describe('Aeproject', () => {
	before(async () => {
		await cleanUp()
		await execute("init", [], executeOptions)
		await execute("epoch", [], executeOptions)
	})

	describe('Compile', () => {
		it('Should compile contract successfully with specif contract path', async () => {
			let result = await execute("compile", ["--path", "./contracts/IdentityContract.aes"], executeOptions)
			
			assert.include(result, expectedCompileResult)
		})

		it('Should compile contract successfully without path', async () => {
			let result = await execute("compile", [], executeOptions)

			assert.include(result, expectedCompileResult)
		})

		it('Should compile multiple contracts successfully with path', async () => {
			let result = await execute("compile", ["--path", "./multipleContractsFolder"], executeOptions)

			assert.include(result, expectedResult1)
			assert.include(result, expectedResult2)
			assert.include(result, expectedResult3)
		})
	})
	
	after(async () => {
		await execute("epoch", ['--stop'], executeOptions)
		await cleanUp()
	})
})