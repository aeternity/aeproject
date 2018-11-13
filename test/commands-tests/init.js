const chai = require('chai');
const chaiFiles = require('chai-files');
const assert = chai.assert;
const execute = require('../../utils.js').execute;
const cleanUp = require("../utils").cleanUp
const fs = require('fs-extra')

let executeOptions = {
	cwd: process.cwd() + "./test/commands-tests/initTests"
};
let expect = chai.expect;
let file = chaiFiles.file;
let dir = chaiFiles.dir;

chai.use(chaiFiles);


describe('Aeproject Init command', () => {
	before(async () => {
		fs.ensureDirSync('./test/commands-tests/initTests')
	})

	it('Should init project successfully', async () => {
		let result = await execute("init", [], executeOptions)

		expect(file(executeOptions.cwd + '/package.json')).to.exist;
		expect(file(executeOptions.cwd + '/package-lock.json')).to.exist;
		expect(file(executeOptions.cwd + '/docker-compose.yml')).to.exist;
		expect(file(executeOptions.cwd + '/test/exampleTest.js')).to.exist;
		expect(file(executeOptions.cwd + '/deploy/deploy.js')).to.exist;
		expect(file(executeOptions.cwd + '/contracts/ExampleContract.aes')).to.exist;
		expect(dir(executeOptions.cwd + '/node_modules')).to.not.be.empty;
		expect(file(executeOptions.cwd + '/docker/entrypoint.sh')).to.exist;
		expect(file(executeOptions.cwd + '/docker/epoch_node1_mean16.yaml')).to.exist;
		expect(file(executeOptions.cwd + '/docker/epoch_node2_mean16.yaml')).to.exist;
		expect(file(executeOptions.cwd + '/docker/epoch_node3_mean16.yaml')).to.exist;
		expect(file(executeOptions.cwd + '/docker/healthcheck.sh')).to.exist;
		expect(file(executeOptions.cwd + '/docker/nginx-cors.conf')).to.exist;
		expect(file(executeOptions.cwd + '/docker/nginx-default.conf')).to.exist;
		expect(file(executeOptions.cwd + '/docker/nginx-ws.conf')).to.exist;
		expect(dir(executeOptions.cwd + '/docker/keys')).to.not.be.empty;

	})

	after(async () => {
		fs.removeSync('./test/commands-tests/initTests');
	})
})