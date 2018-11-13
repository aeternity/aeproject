const chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const assert = chai.assert;
const execute = require('../../utils.js').execute;
let executeOptions = {
	cwd: process.cwd() + "/bin/aeproject/test/"
};


xdescribe('Aeproject Epoch', () => {

	before(async () => {

		await execute("epoch", [], executeOptions)
	})

	it('Should start the epoch successfully', async () => {
		let running = await dockerPs();
		assert.isTrue(running, "Epoch wasn't started properly");

	})

	it('Should stop the epoch successfully', async () => {

		await execute("epoch", ['--stop'], executeOptions)
		let running = await dockerPs();
		assert.isNotTrue(running, "Epoch wasn't stopped properly");

	})

	after(async () => {

		let running = await dockerPs();
		if (running) {
			await execute("epoch", ['--stop'], executeOptions)
		}
	})
})