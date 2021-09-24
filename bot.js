const { Client } = require('discord.js');
const { readFileSync } = require('fs');
const lodash = require('lodash');
const { checkCommand,retrieveImageList,checkAlerts } = require('./src/utils.js');
const { retrieveAllTokensData,retrievePangolinRecentVolume, getPNGCircSupply, getTokenList, getAVAXValue } = require('./src/graph.js');
const { runCommand, runWelcome } = require('./src/commands.js');

//Create instance of bot.
const client = new Client();

const enumStatus =  Object.freeze({
  price:0,
  mcap:1
});
var currentStatus = enumStatus.price;


//Sync read to wait for settings
var settings = JSON.parse(readFileSync('./settings.json'));
console.log('Settings loaded!');
const botPrefix = settings.botprefix;

//Login with set token ID
client.login(settings.tokenid);


client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  //Create timer to refresh tokens data
  await retrieveAllTokensData(client).then(async()=>{
    await refreshPNGData(client);
  });
  await retrievePangolinRecentVolume();
  await retrieveImageList();
  setInterval(retrieveAllTokensData, settings.refreshTokenList, client);
  setInterval(checkAlerts, settings.checkForAlerts, client);
  setInterval(retrievePangolinRecentVolume,settings.refreshTokenList);
  setInterval(refreshPNGData,settings.refreshTokenList+30000,client);
  console.log('Tokens loaded!');
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



async function refreshPNGData(client) {
  //update bot presence

  const filteredResult = lodash.filter(getTokenList(), { "symbol": "PNG" });
  const orderedResult = lodash.orderBy(filteredResult, ["totalLiquidity", "tradeVolume"], ['desc', 'desc']);
  const tokenPrice = (getAVAXValue() * orderedResult[0].derivedETH).toFixed(2);
  const pngTotalSupply = await getPNGCircSupply();
  const mcap = `Circ Mcap $${((tokenPrice * pngTotalSupply)/1_000_000).toFixed(2)}M`;


  let relevantInformation;
  switch(currentStatus){
    case enumStatus.price:
      relevantInformation = `PNG $${tokenPrice}`;
      currentStatus = enumStatus.mcap;
    break;
    case enumStatus.mcap:
      relevantInformation = mcap;
      currentStatus = enumStatus.price;
    break;
  }
  client.user.setPresence({
    status: 'online',
    activity: {
      name: `${relevantInformation}`,
      type: "PLAYING"
    }
  });
}


