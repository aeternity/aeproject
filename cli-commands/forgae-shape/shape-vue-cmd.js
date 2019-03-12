
const utils = require('./../utils');
const forgaeExec = utils.forgaeExecute;
const exec = utils.execute;

const vueRepo = require('./constants.json').repos.vue;

class VueSubCommand {
    constructor(){
        this.name = 'vue'
    }

    async run () {

        await forgaeExec('init');
        await exec('git', 'clone', [vueRepo]);

        console.log('Vue project successfully initialized.');
    } 
}

const subCommand = new VueSubCommand(); 

module.exports = subCommand;