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
                commandHelp(command, msg, settings);
                break;
        }
    }
}

function commandHelp(command, msg, settings) {
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
                '**p!help pangolin**   : What\'s Pangolin?',
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
                commandList.forEach((element) =>{
                    if(strList.length > 0 ){
                        strList+=',';
                    }
                    strList+=`\`${settings.botprefix}${element}\``;
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
                    Description:'`Exchange`: \n'+
                                '**Main Page**: https://pangolin.exchange \n'+
                                '**Exchange Link**: https://app.pangolin.exchange/#/swap \n'+
                                '**Analytics Page**: https://info.pangolin.exchange/#/home \n\n'+
                                '`Community`: \n'+
                                '**Forum Page**: https://gov.pangolin.exchange \n'+
                                '**Discord Group**: https://discord.com/invite/PARrDYYbfw \n'+
                                '**Telegram**: https://t.me/pangolindex \n\n'+
                                '`Feed`: \n'+
                                '**Twitter**: https://twitter.com/pangolindex \n'+
                                '**Github**: https://github.com/pangolindex \n\n'+
                                'Remember to always bookmark your urls (check for https).', 
                    Color: pangoColor
                }
                //send message
                runHelp.sendMessage();
                break;
            case 'pangolin':
                //Feed the command embed
                runHelp.embed = {
                    Title: 'What\'s Pangolin?',
                    Description: '**Pangolin** is a decentralized exchange (**DEX**) which runs on **Avalanche**, '+
                    'uses the same automated market-making (**AMM**) model as Uniswap, '+ 
                    'features a native governance token called **PNG** that is fully community '+
                    'distributed and is capable of trading all tokens issued on Ethereum and **Avalanche**.\n'+
                    'In a crowded marketplace with multiple contenders, '+
                    '**Pangolin** offers three critically important benefits: fast and cheap trades, '+
                    'community-driven development, and a fair and open token distribution.',
                    Color: pangoColor
                }
                //send message
                runHelp.sendMessage();
                break;
            default:
                msg.reply('Sorry, Invalid Command.');
        }
    }

}

module.exports = {
    runCommand: runCommand
}

