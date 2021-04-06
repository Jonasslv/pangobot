const { commandList } = require('./commands.js');

//Function for checking if the command is valid
function checkCommand(str){
    hasCommand = false;
    //For every command in commandList
    commandList.every(function(element, index) {
        hasCommand = (element == str.substring(0,element.length));
        if (hasCommand) return false
        else return true
    })
    return hasCommand;
}

module.exports = {
    checkCommand:checkCommand
}