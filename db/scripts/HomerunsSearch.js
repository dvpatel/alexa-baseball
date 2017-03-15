/*
 *   node HomerunsSearch 1975 25
 *   Get list of players with given HR for a given YEAR in HR order
 */

var async = require('async');
var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

/*
 * Input with default of 2016 20 home runs
 */
var inpYear = (process.argv[2] || 2016)-0 ;
var inpHR = (process.argv[3] || 20)-0 ;

/*
 * Batting table parameters with limit constraint of 25.
 */
var battingParams = {
    TableName : "Batting",
    IndexName : "HomerunsIndex",
    KeyConditionExpression: "yearID = :yr and HR > :hr",
    ExpressionAttributeValues: {
         ":yr": inpYear,
         ":hr": inpHR 
    },
    ScanIndexForward: false,
    Limit: 25,
} ;

var playerParams = {
    TableName : "Players",
    Key:{
        playerID: ""
    },
} ;

/*
 * First chained function to get home runs based on inputed values and results constraint
 */
function homeruns(callback) {
    docClient.query(battingParams, function(err, data) {
        if (err) {
            console.error(err) ;
        } else {
            callback(null, data.Items) ;
        }
    });
}

/*
 * Second chained function to locate player name based on playerID
 */
function playerLookup(hr_items, callback) {
    var r = {} ;
    async.each(hr_items,
        function(item, cb) {
            playerParams.Key.playerID = item.playerID ;
            docClient.get(playerParams, function(err, data) {
                if (err) {
                    console.error(err) ;
                } else {
                	r[item.playerID] = data.Item.firstName + " " + data.Item.lastName ;
                }
                cb() ;
            });
        }, function(err) {
        	callback(null, hr_items, r) ;
        }
    ) ;
}

/*
 * Calling function to get players with inputed home runs or more for inputed year
 */
(function() {
    async.waterfall([ 
        homeruns,
        playerLookup
    ], function(error, hr_items, players) {
        for (var i = 0; i < hr_items.length; i++) {
    	    console.log(hr_items[i].HR + " -  " + players[hr_items[i].playerID]+ ", " + hr_items[i].yearID) ;
        }
    }) ;
})()