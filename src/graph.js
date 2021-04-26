const axios = require('axios');
const lodash = require('lodash');
const { Constants } = require('./resources.js');

var tokenlist;
var AVAXValue;

async function genericQuery(queryObject) {
    let query = await axios({
        url: Constants.pangolinGraphAddress,
        method: 'post',
        data: {
            query: queryObject
        }
    }).catch(error => {
        console.error(error)
    });

    return new Promise( function(resolve,reject){
        resolve(query);
    }); 
}

//Get AVAX Price from the USDT Pair
async function retrieveAVAXPrice(){
    let result = await genericQuery(
        `query {
            pair(id: \"${Constants.USDTAVAXPairContract}\") {
                token1Price
            }
        }`
    );

    if (result.data != undefined) {
        //save JSON List
        AVAXValue = result.data.data.pair.token1Price;
    }

}

//TO-DO this query for now has 1000 tokens limit, although it's prioritizing most traded tokens
//in the future it will need to be upgraded.
async function retrieveAllTokensData(args) {
    let result = await genericQuery(
        `query {
            tokens(first: 1000, orderBy:  tradeVolumeUSD orderDirection:desc) {
                id
                name
                symbol
                decimals
                derivedETH
                totalLiquidity
                tradeVolume
            }
        }`
    );

    if (result.data != undefined) {
        await retrieveAVAXPrice();

        //save JSON List
        tokenlist = result.data.data.tokens;

        //update bot presence
        let filteredResult = lodash.filter(tokenlist, { "symbol": "PNG" });
        let orderedResult =  lodash.orderBy(filteredResult,["totalLiquidity", "tradeVolume"], ['desc', 'desc']);
        let tokenPrice = (getAVAXValue() * orderedResult[0].derivedETH).toFixed(2);

        args.client.user.setPresence({
            status: 'online',
            activity: {
                name: `PNG: $${tokenPrice}`,
                type: "PLAYING"
            }
        });
    }
    setTimeout(retrieveAllTokensData, args.settings.refreshTokenList, args);
}

function getTokenList(){
    return tokenlist;
}

function getAVAXValue(){
    return AVAXValue;
}

module.exports = {
    retrieveAllTokensData: retrieveAllTokensData,
    getTokenList:getTokenList,
    getAVAXValue:getAVAXValue
};