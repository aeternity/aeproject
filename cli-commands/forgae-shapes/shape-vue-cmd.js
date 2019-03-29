const util = require('util');
const childProcess = util.promisify(require('child_process').exec);
const utils = require('./../utils');
const exec = utils.execute;

const fs = require('fs-extra');

const vueRepo = require('./constants.json').repos.vue;
const constants = require('../forgae-init/constants.json');
const vueWebProjectPath = './aepp-forgae-shape-vue';

console.log('udri');
console.log(require);

const init2 = require('./../forgae-init/init');
console.log(init2);
const createForgaeProjectStructure = init2.createForgaeProjectStructure;

console.log(createForgaeProjectStructure);


let self;

class VueSubCommand {
	constructor() {
		this.name = 'vue';
		self = this;
	}

	async run() {
		await createForgaeProjectStructure(true);

		await self.prepareVueProject();

		console.log('===== Vue project successfully initialized. =====');
	}

	async prepareVueProject() {
		console.log('===== Preparation of a ready-to-use aepp with predefined Vue.js frontend framework and forgae integration =====');

		await exec('git', 'clone', [vueRepo]);

		const currentDir = process.cwd();
		process.chdir(vueWebProjectPath);

		await childProcess('npm install');
		process.chdir(currentDir);
	}
}

const subCommand = new VueSubCommand();

module.exports = subCommand;