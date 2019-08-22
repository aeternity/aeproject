const util = require('util');
const childProcess = util.promisify(require('child_process').exec);
const utils = require('aeproject-utils');
const exec = utils.execute;

const reactRepo = require('./constants.json').repos.react;

const reactAeppProjectPath = './aepp-aeproject-shape-react/aepp';
const reactIdentityProviderProjectPath = './aepp-aeproject-shape-react/identity-provider';

const initCommandObject = require("./../aeproject-init/init");
const createAEprojectProjectStructure = initCommandObject.createAEprojectProjectStructure;

let self;

class ReactSubCommand {
    constructor () {
        this.name = 'react';
        self = this;
    }

    async run () {
        await createAEprojectProjectStructure(true);

        await self.prepareProject();

        console.log(`===== '${ self.name }' project successfully initialized. =====`);
    }

    async prepareProject () {
        console.log(`===== Preparation of a ready-to-use aepp with predefined '${ self.name }' frontend framework and aeproject integration =====`);

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