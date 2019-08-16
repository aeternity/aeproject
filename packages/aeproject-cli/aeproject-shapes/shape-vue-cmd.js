const util = require('util');
const childProcess = util.promisify(require('child_process').exec);
const utils = require('aeproject-utils');
const exec = utils.execute;

const vueRepo = require('./constants.json').repos.vue;
const constants = require('../aeproject-init/constants.json');
const vueAeppProjectPath = './aepp-aeproject-shape-vue/aepp';
const vueIdentityProviderProjectPath = './aepp-aeproject-shape-vue/identity-provider';

const initCommandObject = require("./../aeproject-init/init");
const createAEprojectProjectStructure = initCommandObject.createAEprojectProjectStructure;

let self;

class VueSubCommand {
    constructor () {
        this.name = 'vue';
        self = this;
    }

    async run () {
        await createAEprojectProjectStructure(true);

        await self.prepareVueProject();

        console.log('===== Vue project successfully initialized. =====');
    }

    async prepareVueProject () {
        console.log('===== Preparation of a ready-to-use aepp with predefined Vue.js frontend framework and aeproject integration =====');

        await exec('git', 'clone', [vueRepo]);

        const currentDir = process.cwd();
        process.chdir(vueAeppProjectPath);

        await childProcess('npm install');
        process.chdir(currentDir);

        process.chdir(vueIdentityProviderProjectPath);

        await childProcess('npm install');
        process.chdir(currentDir);
    }
}

const subCommand = new VueSubCommand();

module.exports = subCommand;