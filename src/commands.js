const { checkCooldown, makeEmbed } = require('./utils.js');
const { commandList } = require('./commandlist.js');
const { CommandRunner } = require('./objects.js');
const { MessagesStrings } = require('./messages.js')

//Color orange
const pangoColor = 15105570;

var messagesStrings = new MessagesStrings();

function runCommand(command, msg, settings) {
    if (checkCooldown(msg, command.ReportedCommand, settings.cooldownMessage)) {
        switch (command.ReportedCommand) {
            //Help command
            case 'help':
                commandHelp(command, msg, settings);
                break;
        }
    }
}

function runWelcome(settings, member) {
    if (settings.sendWelcomeDM) {
        member.user.createDM().then(channel => {
            let embedObject = {
                Title: 'Welcome to Pangolin DEX Official Discord!',
                Color: pangoColor,
                Description: 'Before posting please read the #faq and #resources!\n' +
                    'If you need any additional information use `p!help` here in DM or in #bot-spam!\n\n'+
                    messagesStrings.getMessage('links')
            };
            channel.send(makeEmbed(embedObject));

        });
    }
}

function commandTokenCheck(command, msg, settings) {


}

function commandHelp(command, msg, settings) {
    runHelp = new CommandRunner(msg);
    //if the command is just help
    if (command.Args.trim().length == 0) {
        //Feed the command embed
        runHelp.embed = {
            Title: 'Pangolin Bot',
            Description: messagesStrings.getMessage('help'),
            Color: pangoColor
        }
        //send message
        runHelp.sendMessage();
    } else {

        //list of other help commands
        switch (command.Args.trim()) {
            case 'cmd':
                //Serialize command list
                let strList = '';
                commandList.forEach((element) => {
                    if (strList.length > 0) {
                        strList += ',';
                    }
                    strList += `\`${settings.botprefix}${element}\``;
                });

                runHelp.embed = {
                    Title: 'Pangolin - Commands',
                    Description: '**Command List:**\n' +
                        strList,
                    Color: pangoColor
                }
                //send message
                runHelp.sendMessage();

                break;
            case 'links':
                //Feed the command embed
                runHelp.embed = {
                    Title: 'Pangolin - Useful Links',
                    Description: messagesStrings.getMessage('links'),
                    Color: pangoColor
                }
                //send message
                runHelp.sendMessage();
                break;
            case 'pangolin':
                //Feed the command embed
                runHelp.embed = {
                    Title: 'What\'s Pangolin?',
                    Description: messagesStrings.getMessage('pangolin'),
                    Color: pangoColor
                }
                //send message
                runHelp.sendMessage();
                break;
            default:messagesStrings
                msg.reply('Sorry, Invalid Command.');
        }
    }

}

module.exports = {
    runCommand: runCommand,
    runWelcome: runWelcome
}

