const { commandList, Constants, TokenImageList } = require('./resources.js');
const StringMask = require('string-mask');
const { MessageEmbed } = require('discord.js');
const { getTokenList, getAVAXValue } = require('./graph.js');
const https = require('https');
const loki = require("lokijs");
const lodash = require('lodash');

var database = new loki('database.db', {
    autoload: true,
    autoloadCallback: databaseInitialize,
    autosave: true,
    autosaveInterval: 4000
});


// implement the autoloadback referenced in loki constructor
function databaseInitialize() {
    var alerts = database.getCollection("alerts");
    if (alerts === null) {
        alerts = database.addCollection("alerts");
    }
    console.log('Database Initialized.');
}

const cooldownSet = new Set();

async function retrieveImageList() {
    Constants.officialTokenLists.forEach((element) => {
        https.get(element, (res) => {
            let body = "";

            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {
                try {
                    (JSON.parse(body)).tokens.forEach((element2) => {
                        TokenImageList.appendTokenImageList({ address: element2.address.toLowerCase(), logoURI: element2.logoURI });
                    });
                } catch (error) {
                    console.error(error.message);
                };
            });
        }).on("error", (error) => {
            console.error(error.message);
        });

    });
}

function sendDMAlert(user, token, element, tokenPrice) {
    function sendDMChannel(channel){
        tokenPrice = formatFloat(tokenPrice);
        let imageList = lodash.filter(TokenImageList.getTokenImageList(), { "address": token[0].id.toLowerCase() });
        let embedObject = {
            Title: token[0].name,
            Color: Constants.pangoColor,
            URL: `${Constants.explorerAdress}address/${token[0].id}`,
            Description: `Token Alert requested by user for price $${element.price}.\n\n` +
                `**ATTENTION**:\n Token: **${token[0].name}** achieved $**${tokenPrice}**, the alert will now be dismissed.`
        };
        if (imageList.length > 0) {
            embedObject.Thumbnail = imageList[0].logoURI;
        }
        channel.send(makeEmbed(embedObject));
    }

    if(user.DMChannel != undefined){
        sendDMChannel(user.DMChannel);
    }else{
        user.createDM().then(channel => {
            sendDMChannel(channel);
        });
    }
}

async function checkAlerts(client) {
    let data = DatabaseHandler.listDatabaseCollection('alerts');
    data.forEach((element) => {
        let token = filterToken(element.tokenId);
        if (token.length > 0) {
            let tokenPrice = (getAVAXValue() * token[0].derivedETH);
            if (element.price > element.oldPrice) {
                if (tokenPrice >= element.price) {
                    client.users.fetch(element.user).then((user) => {
                        if(user != undefined){
                            sendDMAlert(user, token, element, tokenPrice);
                            DatabaseHandler.removeObjDatabase('alerts', {user:element.user,tokenId:element.tokenId,price:element.price});
                        }
                    });
                }
            } else {
                if (tokenPrice <= element.price) {
                    client.users.fetch(element.user).then((user) => {
                        if(user != undefined){
                            sendDMAlert(user, token, element, tokenPrice);
                            DatabaseHandler.removeObjDatabase('alerts', {user:element.user,tokenId:element.tokenId,price:element.price});
                        }
                    });
                }
            }
        }
    });
}

function prettyFormat(nb) {
    nb = nb * 1;
    nb = nb.toFixed(2);
    var formatter = new StringMask('#.##0,00', { reverse: true });
    nb = (nb.toString()).replace(/\D/g, ""); //get rid of the formatting
    return formatter.apply(nb);
}

function formatCurrency(nb) {

    let value = nb > 0.01 ? prettyFormat(nb) : nb > 0.000001 ? Number(nb).toFixed(6) : Number(nb).toExponential(6);

    return `$${value}`;
}


//Function for checking if the command is valid
function checkCommand(str) {
    hasCommand = false;
    let reportedCommand = '';
    let args = '';
    //For every command in commandList
    commandList.every(function (element, index) {
        hasCommand = (element == str.substring(0, element.length));
        args = str.substring(element.length);
        if (hasCommand) {
            reportedCommand = element;
            return false;
        }
        else return true
    })

    //Return if the command is valid, the command and their args
    return {
        ValidCommand: hasCommand,
        ReportedCommand: reportedCommand,
        Args: args
    };
}

//Filter existing tokens
function filterToken(args) {
    let list = getTokenList();

    //Correct Wrapped Names
    if (args == "AVAX") {
        args = "WAVAX"
    }
    if (args == "BTC") {
        args = "WBTC"
    }

    //filter list by symbol, then name, then id
    let filteredResult = lodash.filter(list, { "symbol": args });
    if (filteredResult.length == 0) {
        filteredResult = lodash.filter(list, { "name": args });
    }
    if (filteredResult.length == 0) {
        filteredResult = lodash.filter(list,function(o) { return o.id.toLowerCase() == args.toLowerCase(); });
    }

    return filteredResult;
}

//Cooldown function, stores in memory the cooldown timer, takes settings.json timeout
function checkCooldown(msg, command, cooldownMessage) {
    if (cooldownSet.has(msg.author.id + command)) {
        msg.channel.send('This command is in cooldown, wait a little.').then(message =>
            message.delete({ timeout: cooldownMessage }));
        return false;
    } else {
        cooldownSet.add(msg.author.id + command);
        setTimeout(() => {
            cooldownSet.delete(msg.author.id + command);
        }, cooldownMessage + 1000);
        return true;
    }
}

function makeEmbed(embedObject) {
    let embed = new MessageEmbed()
        // Set the title of the field
        .setTitle(embedObject.Title)
        // Set the color of the embed
        .setColor(embedObject.Color)
        // Put timestamp in the footer
        .setTimestamp()
        // Set the main content of the embed
        .setDescription(embedObject.Description);
    //Lookup for fields
    if (embedObject.Fields != undefined) {
        embed.addFields(embedObject.Fields);
    };
    if (embedObject.Thumbnail != undefined) {
        embed.setThumbnail(embedObject.Thumbnail);
    };
    if (embedObject.Footer != undefined) {
        embed.setFooter(embedObject.Footer);
    }
    if (embedObject.URL != undefined) {
        embed.setURL(embedObject.URL);
    }

    return embed;
}

class DatabaseHandler {
    static listDatabaseCollection(collection) {
        let data = database.getCollection(collection);
        return data.data;
    }

    static searchDatabaseCollection(collection, findTerm) {
        let data = database.getCollection(collection);
        return data.find(findTerm);
    }

    static saveObjDatabase(collection, object) {
        let data = database.getCollection(collection);
        data.insert(object);
        database.saveDatabase();
        return true;
    }

    static removeObjDatabase(collection, object) {
        let data = database.getCollection(collection);
        data.findAndRemove(object);
        database.saveDatabase();
        return true;
    }
}

module.exports = {
    checkCommand: checkCommand,
    checkCooldown: checkCooldown,
    makeEmbed: makeEmbed,
    filterToken: filterToken,
    retrieveImageList: retrieveImageList,
    DatabaseHandler: DatabaseHandler,
    checkAlerts: checkAlerts,
    formatCurrency:formatCurrency
}