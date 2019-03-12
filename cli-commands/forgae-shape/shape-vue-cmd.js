
const utils = require('./../utils');
const forgaeExec = utils.forgaeExecute;
const exec = utils.execute;

class VueSubCommand {
    constructor(){
        this.name = 'vue'
    }

    async run () {
        console.log(process.cwd());

        let cwd = process.cwd();

        let result = await forgaeExec('init');

        console.log('====> <====');
        console.log(result);

        result = await exec('git', 'clone', )

    } 
}

const subCommand = new VueSubCommand(); 

module.exports = {
    subCommand: subCommand.name,
    run : subCommand.run
}