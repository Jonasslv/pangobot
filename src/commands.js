const { checkCooldown, makeEmbed, filterToken, DatabaseHandler,formatFloat } = require('./utils.js');
const { CommandRunner } = require('./objects.js');
const { getAVAXValue,getPangolinRecent } = require('./graph.js');
const { getMessage, Constants, commandList, TokenImageList } = require('./resources.js');
const { getPoolsInfo } = require('./abicalls.js');
const lodash = require('lodash');


function runCommand(command, msg, settings) {
    if (checkCooldown(msg, command.ReportedCommand, settings.cooldownMessage)) {
        switch (command.ReportedCommand) {
            //Help command
            case 'help':
                commandHelp(command, msg, settings);
                break;
            case 'token':
                commandTokenCheck(command, msg);
                break;
            case 'alert':
                commandAlert(command, msg);
                break;
            case 'info':
                commandInfo(command, msg);
                break;
            case 'apy':
                commandApy(command, msg);
                break;
        }
    }
}

function commandApy(command,msg){
    runApy = new CommandRunner(msg);
    let pools = getPoolsInfo();
    pools = lodash.orderBy(pools,["yearlyAPR"], ['desc']);
    if(pools.length > 0){
        let strPools = ``;
        pools.forEach((element) =>{
            strPools += `**[${element.stakeTokenTicker}]**\n`+
                        `**Total Value Locked:** $${element.staked_tvl.toFixed(2)}\n`+
                        `**APR D**:${element.dailyAPR.toFixed(2)}% **W**:${element.weeklyAPR.toFixed(2)}% **Y**:${element.yearlyAPR.toFixed(2)}%\n\n`
        });
        let embedObject = {
            Title: 'Pangolin Top APY List',
            Color: Constants.pangoColor,
            Description: '**PNG** Farming Pools ordered by APY% :farmer: :woman_farmer: :\n\n' +
                strPools
        };
        runApy.embed = embedObject;
        runApy.sendMessage();
    }else{
        msg.reply('Sorry no data has been found.')
    }
}

function commandInfo(command,msg){
    runInfo = new CommandRunner(msg);
    let recentValues = getPangolinRecent();
    let totalLiquidity = (getAVAXValue()*recentValues.totalLiquidityETH).toFixed(2);
    let dailyVolume = (getAVAXValue()*recentValues.dailyVolumeETH).toFixed(2);
    let imageList = lodash.filter(TokenImageList.getTokenImageList(), { "address": Constants.PNGContract.toLowerCase() });
    let embedObject = {
        Title: 'Pangolin Status Information',
        Color: Constants.pangoColor,
        Description: 'This is the stats for **Pangolin DEX**:\n\n' +
            `**Total Liquidity:** $${totalLiquidity}\n`+
            `**Daily Volume:** $${dailyVolume}`,
        Thumbnail: imageList[0].logoURI
    };
    runInfo.embed = embedObject;
    runInfo.sendMessage();
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

function commandAlert(command, msg) {
    //I accept suggestions to fix this spaghetti (it works tho)
    runAlertCreate = new CommandRunner(msg);
    if (command.Args.trim().length == 0) {
        InvalidCommand();
        return;
    }
    let strCommand = command.Args.trim();

    let firstSeparatorPosition = strCommand.indexOf(' ');
    let operation = firstSeparatorPosition == -1 ? strCommand.substr(0) : strCommand.substr(0,firstSeparatorPosition);
    if (['set', 'remove', 'list'].indexOf(operation) == -1) {
        InvalidCommand();
        return;
    }

    if (operation == 'list') {
        let listUser = DatabaseHandler.searchDatabaseCollection('alerts', { user: msg.author.id });
        if (listUser.length == 0) {
            msg.reply("Sorry no alert was found for your user ID.");
        }else{
            let listSerialized = ``;
            listUser.forEach( (element) =>{
                let filteredResult = filterToken(element.tokenId);
                listSerialized+= `**Token**: ${filteredResult[0].symbol} - **Price**: $${element.price}\n`
            });

            let embedObject = {
                Title: 'Token Alert List',
                Color: Constants.pangoColor,
                Description: `List of set Alerts for user: **${msg.author.username}**\n\n` +
                    listSerialized
            };
            runAlertCreate.embed = embedObject;
            runAlertCreate.sendMessage();
        }
    } else {
        if (firstSeparatorPosition == -1) {
            InvalidCommand();
            return;
        }
        let secondSeparatorPosition = (strCommand.substr(firstSeparatorPosition + 1)).indexOf(' ') + 1;
        if (secondSeparatorPosition == -1) {
            InvalidCommand();
            return;
        } else {
            secondSeparatorPosition += firstSeparatorPosition;
        }

        let tokenValue = strCommand.substr(secondSeparatorPosition + 1);
        if (isNaN(tokenValue)) {
            InvalidCommand();
            return;
        }

        let lengthToken = secondSeparatorPosition - firstSeparatorPosition - 1;
        let token = strCommand.substr(firstSeparatorPosition + 1, lengthToken);
        let filteredResult = filterToken(token);
        if (filteredResult.length > 0) {
            let tokenId = filteredResult[0].id;
            let imageList = lodash.filter(TokenImageList.getTokenImageList(), { "address": filteredResult[0].id.toLowerCase() });

            let listUser;
            switch (operation) {
                case 'set':
                    //Query user to see if he is abusing of the alerts
                    listUser = DatabaseHandler.searchDatabaseCollection('alerts', { user: msg.author.id });
                    if (listUser.length >= 10) {
                        msg.reply("Sorry the alerts are limited by 10 for each user.");
                    } else {
                        //Query if it`s a duplicated alert
                        listUser = DatabaseHandler.searchDatabaseCollection('alerts', { user: msg.author.id, price: tokenValue, tokenId: tokenId });
                        if (listUser.length > 0) {
                            msg.reply("This alert seems duplicated, try again.");
                        } else {
                            let oldPrice = (getAVAXValue() * filteredResult[0].derivedETH);
                            oldPrice = formatFloat(oldPrice);
                            if (DatabaseHandler.saveObjDatabase('alerts', { user: msg.author.id, price: tokenValue, tokenId: tokenId, oldPrice:oldPrice })) {
                                let type = tokenValue > oldPrice  ? "above" : "below"; 
                                let embedObject = {
                                    Title: 'Token Alert Create',
                                    Color: Constants.pangoColor,
                                    Description: `Alert created successfully for user **${msg.author.username}**.\n\n` +
                                        `**Token**: ${token}\n` +
                                        `**Price ${type}**: $${tokenValue}`
                                };
                                if (imageList.length > 0) {
                                    embedObject.Thumbnail = imageList[0].logoURI;
                                }
                                runAlertCreate.embed = embedObject;
                                runAlertCreate.sendMessage();
                            }
                        }
                    }
                    break;
                case 'remove':
                    //Query if the alert exists
                    listUser = DatabaseHandler.searchDatabaseCollection('alerts', { user: msg.author.id, price: tokenValue, tokenId: tokenId });
                    if (listUser.length > 0) {
                        if (DatabaseHandler.removeObjDatabase('alerts', { user: msg.author.id, price: tokenValue, tokenId: tokenId })) {
                            let embedObject = {
                                Title: 'Token Alert Remove',
                                Color: Constants.pangoColor,
                                Description: `Alert removed successfully for user **${msg.author.username}**.\n\n` +
                                    `**Token**: ${token}\n` +
                                    `**Price**: $${tokenValue}`
                            };
                            if (imageList.length > 0) {
                                embedObject.Thumbnail = imageList[0].logoURI;
                            }
                            runAlertCreate.embed = embedObject;
                            runAlertCreate.sendMessage();
                        }
                    } else {
                        msg.reply("This alert don't seems to exist, try again.");
                    }
                    break;
            }

        } else {
            msg.reply("Sorry token not found for trade in Pangolin DEX!");
        }
    }

    //If the command is wrongly formmated
    function InvalidCommand() {
        let embedObject = {
            Title: 'Token Alert Command',
            Color: Constants.pangoColor,
            Description: 'Please input the operation, a Ticker or contract address and the value you want to be alerted.\n' +
                'Then you will receive a DM alert if the price get in this value.\n' +
                'Example: `p!alert set/remove PNG 2.40`\n\n'+
                'Alternatively you can list all your alerts too.\n' +
                'Example: `p!alert list`'
        };
        runAlertCreate.embed = embedObject;
        runAlertCreate.sendMessage();
    }
}

//Function for replying user with token value
//TO-DO Price change last 24h, Volume 24h
function commandTokenCheck(command, msg) {
    runTokenCheck = new CommandRunner(msg);
    if (command.Args.trim().length > 0) {
        let filteredResult = filterToken(command.Args.trim());

        if (filteredResult.length > 0) {
            //get token Image
            let imageList = lodash.filter(TokenImageList.getTokenImageList(), { "address": filteredResult[0].id.toLowerCase() });

            let tokenPrice = (getAVAXValue() * filteredResult[0].derivedETH);
            let tradeVolume = (filteredResult[0].tradeVolume * tokenPrice).toFixed(2);
            let totalLiquidity = (filteredResult[0].totalLiquidity * tokenPrice).toFixed(2);
            let embedObject = {
                Title: filteredResult[0].name,
                Color: Constants.pangoColor,
                URL: `${Constants.explorerAdress}address/${filteredResult[0].id}`,
                Description: `**Symbol:** ${filteredResult[0].symbol}\n` +
                    `**Price:** $${formatFloat(tokenPrice)}\n` +
                    `**Total Volume:** $${tradeVolume}\n` +
                    `**Total Liquidity:** $${totalLiquidity}\n\n`,
                Footer: "Values updated every minute"
            };
            if (imageList.length > 0) {
                embedObject.Thumbnail = imageList[0].logoURI;
            }
            runTokenCheck.embed = embedObject;
            runTokenCheck.sendMessage();

        } else {
            msg.reply("Sorry token not found for trade in Pangolin DEX!");
        }

    } else {
        let embedObject = {
            Title: 'Token Information Check',
            Color: Constants.pangoColor,
            Description: 'Please input a Ticker/Token name or contract address.\n' +
                'Example: `p!token PNG`'
        };
        runTokenCheck.embed = embedObject;
        runTokenCheck.sendMessage();
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

