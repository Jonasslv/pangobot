const { Client } = require('discord.js');
const { readFileSync } = require('fs');
const { checkCommand } = require('./src/utils.js');

//Create instance of bot.
const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

//Sync read to wait for settings
var settings = JSON.parse(readFileSync('./settings.json'));
console.log('Settings loaded!');
const botPrefix = settings.botprefix;

//Login with set token ID
client.login(settings.tokenid);

//On message
client.on('message', msg => {
  //Store the content/text of the message
  let msgContent = msg.content;

  //Check for valid command
  if(msgContent != null &&
     msgContent.startsWith(botPrefix) && 
     checkCommand(msgContent.substring(botPrefix.length))){

  }
});


