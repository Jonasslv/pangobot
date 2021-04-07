const { checkCooldown,makeEmbed } = require('./utils.js');
const { commandList } = require('./commandlist.js');

//Color orange
const pangoColor = 15105570;


function runCommand(command,msg,settings){
    if(checkCooldown(msg,command.ReportedCommand,settings.cooldownMessage)){
        switch (command.ReportedCommand){
            case 'help':
                msg.channel.send(makeEmbed({
                    Title:'Pangolin Bot',
                    Color:pangoColor,
                    Description:'placeholder'
                }))
                break;
        }
    }
}
module.exports = {
    runCommand:runCommand
}

