//Preset messages for the Bot
help = 'Bot made for **Pangolin Decentralized Exchange**.\n' +
    '*Powered by Avalanche Blockchain.*\n\n' +
    'Help commands:\n' +
    '**p!help cmd**   : Show command list.\n' +
    '**p!help links** : Show useful links about the exchange.\n' +
    '**p!help pangolin**   : What\'s Pangolin?';

links = '`Information`: \n' +
    '**Main Page**: https://pangolin.exchange \n' +
    '**Tutorials**: https://pangolin.exchange/tutorials/ \n' +
    '**Litepaper**: https://pangolin.exchange/litepaper \n' +
    '**FAQ**: https://pangolin.exchange/faq \n\n' +
    '`Exchange`: \n' +
    '**Exchange Link**: https://app.pangolin.exchange/ \n' +
    '**Analytics Page**: https://info.pangolin.exchange/ \n\n' +
    '`Community`: \n' +
    '**Forum Page**: https://gov.pangolin.exchange \n' +
    '**Discord Group**: https://discord.com/invite/PARrDYYbfw \n' +
    '**Telegram**: https://t.me/pangolindex \n\n' +
    '`Feed`: \n' +
    '**Twitter**: https://twitter.com/pangolindex \n' +
    '**Github**: https://github.com/pangolindex \n\n' +
    'Remember to always bookmark your urls (check for https).';

pangolin = '**Pangolin** is a decentralized exchange (**DEX**) which runs on **Avalanche**, ' +
    'uses the same automated market-making (**AMM**) model as Uniswap, ' +
    'features a native governance token called **PNG** that is fully community ' +
    'distributed and is capable of trading all tokens issued on Ethereum and **Avalanche**.\n' +
    'In a crowded marketplace with multiple contenders, ' +
    '**Pangolin** offers three critically important benefits: fast and cheap trades, ' +
    'community-driven development, and a fair and open token distribution.';


var tokenImageList = [];

function getMessage(messageName) {
    switch (messageName) {
        case 'help': return help;
        case 'links': return links;
        case 'pangolin': return pangolin;
    }
}

var tokenImageList;

module.exports = {
    commandList: [] = ['help', 'apy', 'info', 'token', 'alert'],
    getMessage: getMessage,
    TokenImageList:class{
        static getTokenImageList(){
            return tokenImageList;
        }   
        static appendTokenImageList(newlist){
            tokenImageList.push(newlist); 
        }
    },
    Constants: class {
        static pangoColor = 15105570;
        static explorerAdress = 'https://cchain.explorer.avax.network/';
        static pangolinGraphAddress = "https://graph-node.avax.network/subgraphs/name/dasconnor/pangolindex";
        static USDTAVAXPairContract = "0x9ee0a4e21bd333a6bb2ab298194320b8daa26516";
        static DAIAVAXPairContract = "0x17a2e8275792b4616befb02eb9ae699aa0dcb94b";
        static officialTokenLists = ["https://raw.githubusercontent.com/pangolindex/tokenlists/main/aeb.tokenlist.json",
                                     "https://raw.githubusercontent.com/pangolindex/tokenlists/main/defi.tokenlist.json",
                                     "https://raw.githubusercontent.com/pangolindex/tokenlists/main/stablecoin.tokenlist.json",
                                     "https://raw.githubusercontent.com/pangolindex/tokenlists/main/top15.tokenlist.json",
                                     "https://gist.githubusercontent.com/Jonasslv/3b9337994bbf16c31f8b0de2955ca218/raw/05e18c0461c73911569e7fae6b63aefdd6819238/native.json.tokenlist"];
    }
}





