class ReactSubCommand {
    constructor(){
        this.name = 'react'
    }

    run (options) {
        console.log('Im REACT sub cmd');
    } 
}

const subCommand = new ReactSubCommand(); 

module.exports = {
    subCommand: subCommand.name,
    run : subCommand.run
}