const { Client } = require('discord.js');
const { readFileSync } = require('fs');
const { checkCommand,retrieveImageList,checkAlerts } = require('./src/utils.js');
const { retrieveAllTokensData } = require('./src/graph.js');
const { runCommand, runWelcome } = require('./src/commands.js');

//Create instance of bot.
const client = new Client();


//Sync read to wait for settings
var settings = JSON.parse(readFileSync('./settings.json'));
console.log('Settings loaded!');
const botPrefix = settings.botprefix;

//Login with set token ID
client.login(settings.tokenid);


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  //Create timer to refresh tokens data
  retrieveAllTokensData(client);
  setInterval(retrieveAllTokensData, settings.refreshTokenList, client);
  setInterval(checkAlerts, settings.checkForAlerts, client);
  console.log('Tokens loaded!');
  retrieveImageList();
});

client.on('guildMemberAdd', member => {
  runWelcome(settings, member);
});

//On message
client.on('message', msg => {
  //Store the content/text of the message
  let msgContent = msg.content;

  //Help Alternatives
  if (msgContent == botPrefix || (msgContent == '<@!' + client.user.id + '>')) {
    msgContent = `${botPrefix}help`;
  }

  //Check for valid command
  if (msgContent != null &&
    msgContent.startsWith(botPrefix)) {
    //Generates the command object with args
    let command = checkCommand(msgContent.substring(botPrefix.length));

    command.ValidCommand ? runCommand(command, msg, settings) : msg.reply('Sorry, invalid command.');
  }
});


