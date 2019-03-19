const util = require('util');
const childProcess = util.promisify(require('child_process').exec);

const utils = require('./../utils');
const forgaeExec = utils.forgaeExecute;
const exec = utils.execute;

const fs = require('fs-extra');

const vueRepo = require('./constants.json').repos.vue;
const constants = require('../forgae-init/constants.json');
const copyFileOrDir = require('../utils').copyFileOrDir;
const vueWebProjectPath = './aepp-forgae-shape-vue';

let self;

class VueSubCommand {
	constructor() {
		this.name = 'vue'
		self = this;
	}

	async run() {
		console.log('Preparation of a ready-to-use aepp with predefined Vue.js frontend framework and forgae integration');

		await forgaeExec('init');

		await self.prepareVueProject();

		console.log('Vue project successfully initialized.');
	}

	async prepareVueProject() {
		fs.removeSync(constants.contractFileDestination);
		const fileSource = `${__dirname}${constants.artifactsDir}/${constants.contractTemplateFile}`;
		copyFileOrDir(fileSource, constants.contractFileDestination);

		await exec('git', 'clone', [vueRepo]);

		const currentDir = process.cwd();
		process.chdir(vueWebProjectPath);

		await childProcess('npm install');
		process.chdir(currentDir);
	}
}

const subCommand = new VueSubCommand();

module.exports = subCommand;