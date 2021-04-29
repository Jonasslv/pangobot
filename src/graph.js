const axios = require('axios');
const lodash = require('lodash');
const { Constants } = require('./resources.js');

var tokenlist;
var AVAXValue;
var pangolinRecent;

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
    let USDTPrice = await genericQuery(
        `query {
            pair(id: \"${Constants.USDTAVAXPairContract}\") {
                token1Price
            }
        }`
    );

    let DAIPrice = await genericQuery(
        `query {
            pair(id: \"${Constants.DAIAVAXPairContract}\") {
                token1Price
            }
        }`
    );

    if (USDTPrice.data != undefined && DAIPrice.data != undefined) {
        AVAXValue = undefined;
        //Mid-term between DAI and USDT price 
        AVAXValue = (USDTPrice.data.data.pair.token1Price/2.0)+(DAIPrice.data.data.pair.token1Price/2.0);
    }

}

//TO-DO this query for now has 1000 tokens limit, although it's prioritizing most traded tokens
//in the future it will need to be upgraded.
async function retrieveAllTokensData(client) {
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
        tokenlist = undefined;
        tokenlist = result.data.data.tokens;

        //update bot presence
        let filteredResult = lodash.filter(tokenlist, { "symbol": "PNG" });
        let orderedResult =  lodash.orderBy(filteredResult,["totalLiquidity", "tradeVolume"], ['desc', 'desc']);
        let tokenPrice = (getAVAXValue() * orderedResult[0].derivedETH).toFixed(2);

        client.user.setPresence({
            status: 'online',
            activity: {
                name: `PNG: $${tokenPrice}`,
                type: "PLAYING"
            }
        });
    }
}


async function retrievePangolinRecentVolume(){
    let pangoResult = await genericQuery(
            `query {
                pangolinDayDatas(orderBy:date,orderDirection:desc,first:1){
                    totalLiquidityETH
                    dailyVolumeETH
                    date
                }
            }`
    );
    if (pangoResult.data != undefined) {
        pangolinRecent = pangoResult.data.data.pangolinDayDatas[0];
    }
}

function getTokenList(){
    return tokenlist;
}

function getAVAXValue(){
    return AVAXValue;
}


function getPangolinRecent(){
    return pangolinRecent;
}

module.exports = {
    retrieveAllTokensData: retrieveAllTokensData,
    getTokenList:getTokenList,
    getAVAXValue:getAVAXValue,
    retrievePangolinRecentVolume:retrievePangolinRecentVolume,
    getPangolinRecent:getPangolinRecent
};