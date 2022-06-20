import { Meteor } from 'meteor/meteor';
import { Sales } from '../sales.js';
import { Recipes } from '../../recipes/recipes.js';
import { Transactions } from '../../transactions/transactions.js';
import {sanitizeUrl} from "@braintree/sanitize-url";

if (Meteor.isServer) {
    Meteor.methods({

        'Sales.upsertSales': async function(){
            this.unblock();
            try{
                
                // finding the transactions of sales type
                var txns = Transactions.find({
                    'tx_response.raw_log': /EventCreateExecution/,
                    'tx_response.logs.events.type': {$ne: 'burn'}
                },
                {
                    sort:{'tx_response.timestamp': -1}
                }
                ).fetch();

                // looping through these transactions and extracting the required fields
                for (var i = 0; i < txns.length; i++){

                    //extracting the required fields
                    var recipeID = txns[i]?.tx?.body?.messages[0]?.recipeID
                    var recipe = Recipes.findOne({ID: recipeID})
                    var nftName = getNftName(recipe)
                    var nftUrl = getNftUrl(recipe)
                    var amountString = getAmountString(txns[i])
                    var amount = getAmount(amountString)
                    var coin = getCoin(amountString)
                    var receiver = getReceiver(txns[i])
                    var spender = getSpender(txns[i])
                    
                    //constructing the sale object
                    var sale = {
                        txhash: txns[i]?.txhash,
                        type: "Sale",
                        itemName: nftName,
                        itemImg: nftUrl,
                        amount: amount,
                        coin: coin,
                        from: receiver,
                        to: spender,
                        time: txns[i]?.tx_response?.timestamp
                    }
                    
                    // inserting the extracted information in sales collection
                    Sales.upsert({'txhash': txns[i].txhash},{$set: sale})

                }

            }
            catch (e) {
                console.log("upsertSales error: ", e)
            }  
        },
        'Sales.getSales': async function(limit, offset){

            //all sales with limit and starting from offset
            var sales = Sales.find({

            },
            {
                sort:{'time': -1},
                limit: limit,
                skip: offset,
            }
            ).fetch();

            for (var i = 0; i < sales.length; i++){
                let buyerUsername = getUserNameInfo(sales[i]?.to)
                let sellerUsername = getUserNameInfo(sales[i].from)

                sales[i]["buyerUsername"] = buyerUsername?.username?.value
                sales[i]["sellerUsername"] = sellerUsername?.username?.value
            }

            return sales
        },
        'Sales.getSaleOfAllTime': async function(){

            //sale of all time
            var sale = Sales.find({

            },
            {
                sort:{'amount': -1, 'time': -1},
                limit: 1
            }
            ).fetch();

            if (sale[0] != null && sale[0] != undefined){
                let buyerUsername = getUserNameInfo(sale[0].to)
                let sellerUsername = getUserNameInfo(sale[0].from)

                sale[0]["buyerUsername"] = buyerUsername?.username?.value
                sale[0]["sellerUsername"] = sellerUsername?.username?.value
            }

            return sale

        },
        'Sales.getSaleOfTheDay': async function() {

            var start = new Date();
            start.setHours(0,0,0,0);
            var startDate = getFormattedDate(start)

            var end = new Date();
            end.setDate(end.getDate() + 1)
            end.setHours(0,0,0,0);
            var endDate = getFormattedDate(end)

            //sale of today
            var sale = Sales.find({
                time: { "$gte": startDate, "$lt": endDate }
            },
            {
                sort:{'amount': -1},
                limit: 1
            }
            ).fetch()

            if (sale[0] != null && sale[0] != undefined){
                let buyerUsername = getUserNameInfo(sale[0].to)
                let sellerUsername = getUserNameInfo(sale[0].from)

                sale[0]["buyerUsername"] = buyerUsername?.username?.value
                sale[0]["sellerUsername"] = sellerUsername?.username?.value
            }

            return sale
            
        }
    });
}

//separating amount from the amountString which is like '100000upylon'
function getAmount(amountString) {
    var quantity = parseFloat(amountString.replace( /[^\d\.]*/g, ''));
    return quantity
}

//separating the coin from the amountString
function getCoin(amountString) {
    var quantity = parseFloat(amountString.replace( /[^\d\.]*/g, ''));
    var coin = amountString.replace(quantity, '')
    return coin
}

//getting the nft url from recipe object
function getNftUrl(recipe) {

    var nftUrl = ""
    var itemOutputs = recipe?.entries?.itemOutputs
    if (itemOutputs != null && itemOutputs != undefined ){
        if (itemOutputs[0] != null){
            var properties = itemOutputs[0].strings
            for (var i = 0; i < properties.length; i++){
                if (properties[i].key == "NFT_URL"){
                    nftUrl = properties[i].value
                    break;
                }
            }
            
        }
    }
    return nftUrl
}

//getting the nft name form the recipe object
function getNftName(recipe) {

    return recipe?.name
}

//getting amountString from the executed transaction
function getAmountString(txn) {

    var amountString = ""
    var events = txn?.tx_response?.logs[0]?.events

    if (events != null && events != undefined){
        for (var i = 0; i < events.length; i++){
            if (events[i].type == "coin_received"){
                var attributes = events[i].attributes
                for (var j = 0; j < attributes.length; j++){
                    if (attributes[j].key == "amount"){
                        amountString = attributes[j].value
                        break;
                    }
                }
            }
        }
    }

    return amountString
}

//getting the receiver out of the transaction object
function getReceiver(txn) {

    var receiver = ""
    var events = txn?.tx_response?.logs[0]?.events

    if (events != null && events != undefined){
        for (var i = 0; i < events.length; i++){
            if (events[i].type == "coin_received"){
                var attributes = events[i].attributes
                for (var j = 0; j < attributes.length; j++){
                    if (attributes[j].key == "receiver"){
                        receiver = attributes[j].value
                        break;
                    }
                }
            }
        }
    }

    return receiver
}

//getting the spender object out of the transaction object
function getSpender(txn) {

    var spender = ""
    var events = txn?.tx_response?.logs[0]?.events

    if (events != null && events != undefined){
        for (var i = 0; i < events.length; i++){
            if (events[i].type == "coin_spent"){
                var attributes = events[i].attributes
                for (var j = 0; j < attributes.length; j++){
                    if (attributes[j].key == "spender"){
                        spender = attributes[j].value
                        break;
                    }
                }
            }
        }
    }

    return spender
}

//getting the date in required format i.e. (2022-04-12)
function getFormattedDate(date){

    var monthString = (date.getMonth() + 1) + ""
    if (monthString.length == 1){
        monthString = "0" + (date.getMonth() + 1)
    }

    var dateString = date.getDate() + ""
    if (dateString.length == 1){
        dateString = "0" + date.getDate()
    }

    var formattedDate = date.getFullYear() + "-" + monthString + "-" + dateString
    return formattedDate
}

//fetching the username info
function getUserNameInfo(address){
    var result;
    try{
        let response = HTTP.get(
            sanitizeUrl(`${Meteor.settings.remote.api}/pylons/account/address/${address}`)
        );
        result = JSON.parse(response.content);
    }
    catch(e){
        console.log("error getting userNameInfo: ", e)
    }
    return result
}

