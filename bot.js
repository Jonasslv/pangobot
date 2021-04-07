const { Client } = require('discord.js');
const { readFileSync } = require('fs');
const { checkCommand } = require('./src/utils.js');
const { runCommand } = require('./src/commands.js');

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
});


//On message
client.on('message', msg => {
  //Store the content/text of the message
  let msgContent = msg.content;

  //Check for valid command
  if(msgContent != null &&
     msgContent.startsWith(botPrefix)){
      let command = checkCommand(msgContent.substring(botPrefix.length));
      if (command.ValidCommand){
        runCommand(command,msg,settings);
      }else{
        msg.reply('Sorry, invalid command.');
      }
  }
});


