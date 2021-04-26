const { checkCooldown, makeEmbed } = require('./utils.js');
const lodash = require('lodash');
const { commandList } = require('./commandlist.js');
const { CommandRunner } = require('./objects.js');
const { getTokenList, getAVAXValue } = require('./graph.js');
const { getMessage, Constants } = require('./resources.js');


function runCommand(command, msg, settings) {
    if (checkCooldown(msg, command.ReportedCommand, settings.cooldownMessage)) {
        switch (command.ReportedCommand) {
            //Help command
            case 'help':
                commandHelp(command, msg, settings);
                break;
            case 'token':
                commandTokenCheck(command, msg, settings);
                break;
        }
    }
}

function runWelcome(settings, member) {
    if (settings.sendWelcomeDM && member.guild.id == settings.pangolinServerID) {
        member.user.createDM().then(channel => {
            let embedObject = {
                Title: 'Welcome to Pangolin DEX Community Discord!',
                Color: Constants.pangoColor,
                Description: 'Before posting please read the #faq and #resources!\n' +
                    'If you need any additional information use `p!help` here in DM or in #bot-spam!\n\n' +
                    getMessage('links')
            };
            channel.send(makeEmbed(embedObject));

        });
    }
}

//Function for replying user with token value
function commandTokenCheck(command, msg, settings) {
    runTokenCheck = new CommandRunner(msg);
    if (command.Args.trim().length > 0) {
        let list = getTokenList();

        //Correct Wrapped Names
        if (command.Args.trim() == "AVAX") {
            command.Args = "WAVAX"
        }
        if (command.Args.trim() == "BTC") {
            command.Args = "WBTC"
        }

        //filter list
        let filteredResult = lodash.filter(list, { "symbol": command.Args.trim() })
        let orderedResult = lodash.orderBy(filteredResult, ["totalLiquidity", "tradeVolume"], ['desc', 'desc']);

        if (orderedResult.length > 0) {

            let tokenPrice = (getAVAXValue() * orderedResult[0].derivedETH);
            let tradeVolume = (orderedResult[0].tradeVolume * tokenPrice).toFixed(2);
            let totalLiquidity = (orderedResult[0].totalLiquidity * tokenPrice).toFixed(2);
            let embedObject = {
                Title: orderedResult[0].name,
                Color: Constants.pangoColor,
                URL: `${Constants.explorerAdress}address/${orderedResult[0].id}`,
                Description: `**Symbol:** ${orderedResult[0].symbol}\n` +
                    `**Price:** $${tokenPrice > 0.01 ? tokenPrice.toFixed(2) :
                        tokenPrice > 0.000001 ? tokenPrice.toFixed(6) : tokenPrice.toFixed(18)}\n` +
                    `**Total Volume:** $${tradeVolume}\n` +
                    `**Total Liquidity:** $${totalLiquidity}\n\n`,
                Footer: "Values updated every minute"
            };
            runTokenCheck.embed = embedObject;
            runTokenCheck.sendMessage();

        } else {
            msg.reply("Sorry token not found!");
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
            Description: getMessage('help'),
            Color: Constants.pangoColor
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
                    Color: Constants.pangoColor
                }
                //send message
                runHelp.sendMessage();

                break;
            case 'links':
                //Feed the command embed
                runHelp.embed = {
                    Title: 'Pangolin - Useful Links',
                    Description: getMessage('links'),
                    Color: Constants.pangoColor
                }
                //send message
                runHelp.sendMessage();
                break;
            case 'pangolin':
                //Feed the command embed
                runHelp.embed = {
                    Title: 'What\'s Pangolin?',
                    Description: getMessage('pangolin'),
                    Color: Constants.pangoColor
                }
                //send message
                runHelp.sendMessage();
                break;
            default: messagesStrings
                msg.reply('Sorry, Invalid Command.');
        }
    }

}

module.exports = {
    runCommand: runCommand,
    runWelcome: runWelcome
}

