import { Meteor } from 'meteor/meteor';
import { Listings } from '../listings.js';
import { Recipes } from '../../recipes/recipes.js';
import { Transactions } from '../../transactions/transactions.js';
import {sanitizeUrl} from "@braintree/sanitize-url";

Meteor.methods({

    'Listings.upsertListings': async function(){
        this.unblock();
        try{

            // finding the transactions of sales type
            var txns = Transactions.find({'tx_response.raw_log': /EventCreateRecipe/},{sort:{'tx_response.timestamp': -1}}).fetch();

            // looping through these transactions and extracting the required fields
            for (i = 0; i <= txns.length; i++){

                // extracting the required fields
                var recipeID = txns[i]?.tx?.body?.messages[0]?.recipeID
                var recipe = Recipes.findOne({ID: recipeID})
                var nftName = getNftName(recipe)
                var nftUrl = getNftUrl(recipe)
                var coinInvolved = txns[i]?.tx?.body?.messages[0]?.coinInputs[0]?.coins[0]
                var creator = txns[i]?.tx?.body?.messages[0]?.creator

                // constructing the listing object
                var listing = {
                    txhash: txns[i]?.txhash,
                    itemImg: nftUrl,
                    itemName: nftName,
                    amount: parseFloat(coinInvolved?.amount),
                    coin: coinInvolved?.denom,
                    type: "Listing",
                    from: creator,
                    time: txns[i]?.tx_response?.timestamp
                }

                // inserting the extracted information in sales collection
                Listings.upsert({'txhash': txns[i].txhash},{$set: listing})

            }
            
        }
        catch (e) {
            console.log("upserListing error: ", e)
        }  
    },
    'Listings.getListings': async function(limit, offset){

        //all listings with limit and starting from offset
        var listings = Listings.find({

        },
        {
            sort:{'time': -1},
            limit: limit,
            skip: offset,
        }
        ).fetch();

        for (var i = 0; i < listings.length; i++){
            let creatorUsername = getUserNameInfo(listings[i]?.from)
    
            listings[i]["creatorUsername"] = creatorUsername?.username?.value
        }

        return listings
    },
    'Listings.getCreatorOfAllTime': async function(){

        var mongoListing = Listings.rawCollection()

        var creatorOfAllTime = await mongoListing.aggregate([
        { 
            $group: {
                _id: "$from", // grouping on from field
                count: { $sum: 1 }
            }
        },
        {
            $sort: {count: -1} // sorting on the basis of count in descending order
        },
        {
            $limit: 1 // fetching the top-most document
        }
        ]).toArray()
            
        if (creatorOfAllTime[0] != null && creatorOfAllTime[0] != undefined){        
            var creatorUsername = getUserNameInfo(creatorOfAllTime[0]._id)
            creatorOfAllTime[0].creatorUsername = creatorUsername?.username?.value
        }

        return creatorOfAllTime

    },
    'Listings.getCreatorOfTheDay': async function() {

        // start of today
        var start = new Date();
        start.setHours(0,0,0,0);
        var startDate = getFormattedDate(start)

        // end of today
        var end = new Date();
        end.setDate(end.getDate() + 1)
        end.setHours(0,0,0,0);
        var endDate = getFormattedDate(end)

        var mongoListing = Listings.rawCollection()
        var creatorOfTheDay = await mongoListing.aggregate([
            {
                $match: { 
                    time: {
                        "$gte": startDate, // documents with time greater than or equal to startDate
                        "$lt": endDate // and documents with time less than endDate
                    }
                }
            },
            {
                $group: {
                    _id: "$from", //group the matching documents on from field
                    count: { $sum: 1 } // count the documents in each group
                }
            },
            {
                $sort: {count: -1} // sort the groups on count field in descending order
            },
            {
                $limit: 1 // get the top-most document
            }
        ]).toArray()

        if (creatorOfTheDay[0] != null && creatorOfTheDay[0] != undefined){
            var creatorUsername = getUserNameInfo(creatorOfTheDay[0]._id)
            creatorOfTheDay[0]["creatorUsername"] = creatorUsername?.username?.value
        }

        return creatorOfTheDay
    }
});

//getFormattedDate to get date in format (2022-04-12)
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

//getting the nft url out of the recipe object
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

//getting the nft name out of the recipe object
function getNftName(recipe) {

    return recipe?.name
}

//fetching username info 
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