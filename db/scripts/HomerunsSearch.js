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


//  Inputs or default value
var inpYear = (process.argv[2] || 2016)-0 ;
var inpHR = (process.argv[3] || 10)-0 ;


//  Table parameters ;
var battingParams = {
    TableName : "Batting",
    IndexName : "HomerunsIndex",
    KeyConditionExpression: "yearID = :yr and HR > :hr",
    ExpressionAttributeValues: {
         ":yr": inpYear,
         ":hr": inpHR 
    },
    ScanIndexForward: false,
    //Limit: 25,
} ;

var playerParams = {
    TableName : "Players",
    Key:{
        playerID: ""
    },
} ;

function homeruns(callback) {
    docClient.query(battingParams, function(err, data) {
        if (err) {
            console.error(err) ;
        } else {
            callback(null, data.Items) ;
        }
    });
}

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

function getHomeruns() {
    async.waterfall([ 
        homeruns,
        playerLookup
    ], function(error, hr_items, players) {
        for (var i = 0; i < hr_items.length; i++) {
    	    console.log(hr_items[i].HR + " -  " + players[hr_items[i].playerID]+ ", " + hr_items[i].yearID) ;
        }
    }) ;
}

getHomeruns() ;
