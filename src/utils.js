const { commandList } = require('./commandlist.js');
const { MessageEmbed } = require('discord.js');

const cooldownSet = new Set();

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

//Cooldown function, stores in memory the cooldown timer, takes settings.json timeout
function checkCooldown(msg, command, cooldownMessage) {
    if (cooldownSet.has(msg.guild.id + command)) {
        msg.channel.send('This command is in cooldown, wait a little.').then(message =>
            message.delete({timeout:cooldownMessage}));
        return false;
    } else {
        cooldownSet.add(msg.guild.id + command);
        setTimeout(() => {
            cooldownSet.delete(msg.guild.id + command);
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
      // Set the main content of the embed
      .setDescription(embedObject.Description);
    //Lookup for fields
    if (embedObject.Fields != undefined){
        embed.SetFields(embedObject.Fields);
    }
    return embed;
}


module.exports = {
    checkCommand:checkCommand,
    checkCooldown:checkCooldown,
    makeEmbed:makeEmbed
}