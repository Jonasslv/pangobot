const { checkCooldown } = require('./utils.js');
const { commandList } = require('./commandlist.js');
const { CommandRunner } = require('./objects.js');

//Color orange
const pangoColor = 15105570;

function runCommand(command, msg, settings) {
    if (checkCooldown(msg, command.ReportedCommand, settings.cooldownMessage)) {
        switch (command.ReportedCommand) {
            //Help command
            case 'help':
                commandHelp(command, msg);
                break;
        }
    }
}

function commandHelp(command, msg) {
    runHelp = new CommandRunner(msg);
    //if the command is just help
    if (command.Args.trim().length == 0) {
        //Feed the command embed
        runHelp.embed = {
            Title: 'Pangolin Bot',
            Description: 'Bot made for **Pangolin Decentralized Exchange**.\n' +
                '*Powered by Avalanche Blockchain.*\n\n' +
                'Help commands:\n' +
                '**p!help cmd**   : Show command list.\n' +
                '**p!help links** : Show useful links about the exchange.\n' +
                '**p!help png**   : What\'s PNG?',
            Color: pangoColor
        }
        //send message
        runHelp.sendMessage();
    } else {

        //list of other help commands
        switch (command.Args.trim()) {
            case 'cmd':

                break;
            case 'links':

                break;
            case 'png':

                break;
            default:
                msg.reply('Sorry, Invalid Command.');
        }
    }

}

module.exports = {
    runCommand: runCommand
}

