const util = require('util');
const childProcess = util.promisify(require('child_process').exec);
const utils = require('forgae-utils');
const exec = utils.execute;

const reactRepo = require('./constants.json').repos.react;
const constants = require('../forgae-init/constants.json');

const reactAeppProjectPath = './aepp-forgae-shape-react/aepp';
const reactIdentityProviderProjectPath = './aepp-forgae-shape-react/identity-provider';

const initCommandObject = require("./../forgae-init/init");
const createForgaeProjectStructure = initCommandObject.createForgaeProjectStructure;

let self;

class ReactSubCommand {
    constructor () {
        this.name = 'react';
        self = this;
    }

    async run () {
        await createForgaeProjectStructure(true);

        await self.prepareVueProject();

        console.log('===== React project successfully initialized. =====');
    }

    async prepareVueProject () {
        console.log('===== Preparation of a ready-to-use aepp with predefined Vue.js frontend framework and forgae integration =====');

        await exec('git', 'clone', [ reactRepo ]);

        const currentDir = process.cwd();
        process.chdir(reactAeppProjectPath);

        await childProcess('npm install');
        process.chdir(currentDir);

        process.chdir(reactIdentityProviderProjectPath);

        await childProcess('npm install');
        process.chdir(currentDir);
    }
}

const subCommand = new ReactSubCommand();

module.exports = subCommand;