const util = require('util');
const childProcess = util.promisify(require('child_process').exec);
const utils = require('forgae-utils');
const exec = utils.execute;

const angularRepo = require('./constants.json').repos.angular;
const constants = require('../forgae-init/constants.json');
const angularAeppProjectPath = './aepp-forgae-shape-angular/aepp';
const angularIdentityProviderProjectPath = './aepp-forgae-shape-angular/identity-provider';

const initCommandObject = require("../forgae-init/init");
const createForgaeProjectStructure = initCommandObject.createForgaeProjectStructure;

let self;

class AngularSubCommand {
    constructor () {
        this.name = 'angular';
        self = this;
    }

    async run () {
        await createForgaeProjectStructure(true);

        await self.prepareAngularProject();

        console.log('===== Angular project successfully initialized. =====');
    }

    async prepareAngularProject () {
        console.log('===== Preparation of a ready-to-use aepp with predefined Angular.js frontend framework and forgae integration =====');

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