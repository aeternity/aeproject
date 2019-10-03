const util = require('util');
const childProcess = util.promisify(require('child_process').exec);
const utils = require('aeproject-utils');
const exec = utils.execute;

const angularRepo = require('./constants.json').repos.angular;
const constants = require('../aeproject-init/constants.json');
const angularAeppProjectPath = './aepp-aeproject-shape-angular/aepp';
const angularIdentityProviderProjectPath = './aepp-aeproject-shape-angular/identity-provider';

const initCommandObject = require("../aeproject-init/init");
const createAEprojectProjectStructure = initCommandObject.createAEprojectProjectStructure;

let self;

class AngularSubCommand {
    constructor () {
        this.name = 'angular';
        self = this;
    }

    async run () {
        await createAEprojectProjectStructure(true);

        await self.prepareAngularProject();

        console.log('===== Angular project successfully initialized. =====');
    }

    async prepareAngularProject () {
        console.log('===== Preparation of a ready-to-use aepp with predefined Angular.js frontend framework and aeproject integration =====');

        await exec('git', 'clone', [angularRepo]);

        const currentDir = process.cwd();
        process.chdir(angularAeppProjectPath);

        await childProcess('npm install');
        process.chdir(currentDir);

        process.chdir(angularIdentityProviderProjectPath);

        await childProcess('npm install');
        process.chdir(currentDir);
    }
}

const subCommand = new AngularSubCommand();

module.exports = subCommand;