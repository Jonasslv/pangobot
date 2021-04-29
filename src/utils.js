const { commandList,Constants,TokenImageList } = require('./resources.js');
const { MessageEmbed } = require('discord.js');
const { getTokenList } = require('./graph.js');
const https = require('https');
const loki = require("lokijs");
const lodash = require('lodash');

var database = new loki('database.db', {
    autoload: true,
    autoloadCallback : databaseInitialize,
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

async function retrieveImageList(){
    Constants.officialTokenLists.forEach((element) => {
        https.get(element,(res) => {
            let body = "";
        
            res.on("data", (chunk) => {
                body += chunk;
            });
        
            res.on("end", () => {
                try {
                    (JSON.parse(body)).tokens.forEach((element2) =>{
                        TokenImageList.appendTokenImageList({address:element2.address.toLowerCase(),logoURI:element2.logoURI});
                    });
                    console.log("Loaded image list.");
                } catch (error) {
                    console.error(error.message);
                };
            });
        }).on("error", (error) => {
            console.error(error.message);
        });  

    });
}

//Function for checking if the command is valid
function checkCommand(str){
    hasCommand = false;
    let reportedCommand = '';
    let args = '';
    //For every command in commandList
    commandList.every(function(element, index) {
        hasCommand = (element == str.substring(0,element.length));
        args = str.substring(element.length);
        if (hasCommand) {
            reportedCommand = element;
            return false;
        }
        else return true
    })

    //Return if the command is valid, the command and their args
    return {ValidCommand:hasCommand,
            ReportedCommand:reportedCommand,
            Args:args};
}

//Filter existing tokens
function filterToken(args){
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
        filteredResult = lodash.filter (list, { "name": args });
    }
    if (filteredResult.length == 0) {
        filteredResult = lodash.filter (list, { "id": args });
    }
    
    return filteredResult;
}

//Cooldown function, stores in memory the cooldown timer, takes settings.json timeout
function checkCooldown(msg, command, cooldownMessage) {
    if (cooldownSet.has(msg.author.id + command)) {
        msg.channel.send('This command is in cooldown, wait a little.').then(message =>
            message.delete({timeout:cooldownMessage}));
        return false;
    } else {
        cooldownSet.add(msg.author.id + command);
        setTimeout(() => {
            cooldownSet.delete(msg.author.id + command);
        }, cooldownMessage+1000);
        return true;
    }
}

function makeEmbed(embedObject){
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
    if (embedObject.Fields != undefined){
        embed.addFields(embedObject.Fields);
    };
    if(embedObject.Thumbnail != undefined){
        embed.setThumbnail(embedObject.Thumbnail);
    };
    if(embedObject.Footer != undefined){
        embed.setFooter(embedObject.Footer);
    }
    if(embedObject.URL != undefined){
        embed.setURL(embedObject.URL);
    }
    
    return embed;
}


module.exports = {
    checkCommand:checkCommand,
    checkCooldown:checkCooldown,
    makeEmbed:makeEmbed,
    filterToken:filterToken,
    retrieveImageList:retrieveImageList,
    DatabaseHandler:class{
        static listDatabaseCollection(collection){
            let data = database.getCollection(collection);
            return data.data;
        }

        static searchDatabaseCollection(collection,findTerm){
            let data = database.getCollection(collection);
            return data.find(findTerm);
        }

        static saveObjDatabase(collection,object){
            let data = database.getCollection(collection);
            data.insert(object);
            database.saveDatabase();
            return true;
        }

        static removeObjDatabase(collection,object){
            let data = database.getCollection(collection);
            data.findAndRemove(object);
            database.saveDatabase();
            return true;
        }
    }
}