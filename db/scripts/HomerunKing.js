/*
 *  node HomerunKing 1990 1995
 *  Find top HR hitters for given year range
 */

var async = require('async');
var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

/*
 * Set start and end year with defaults 2015  2016
 */
var startYear = (process.argv[2] || 2015)-0 ;
var endYear = (process.argv[3] || 2016)-0 ;
var n = endYear - startYear ; 

/*
 * Table configuration.  Note ScanIndexForward value of false.  This is needed to retrieve sorted results from DynamoDB.
 */
var battingParams = {
    TableName : "Batting",
    IndexName : "HomerunsIndex",
    KeyConditionExpression: "yearID = :yr",
    ExpressionAttributeValues: {
         ":yr": endYear,
    },
    ScanIndexForward: false,
    Limit: 1,
} ;

var playerParams = {
    TableName : "Players",
    Key:{
        playerID: ""
    },
} ;

/*
 * get home runs and playerID for given range
 */
function homeruns(callback) {
    var yrRange = [] ;
    for (var i = 0; i < n; i++) {
	yrRange.push(endYear - i) ;	
    }

    var results = [] ;
    async.each(yrRange,
        function(yr, cb) {
            battingParams.ExpressionAttributeValues[":yr"] = yr ;

            docClient.query(battingParams, function(err, data) {
                if (err) {
                    console.error(err) ;
                } else {
                    results.push(data.Items[0]) ;
                }

                cb() ;
            });

        }, function(err) {
	    callback(null, results) ;
	}
    ) ;
}

/*
 * for each playerID, lookup player name from Players table
 */
function playerLookup(results, callback) {
    var playerMap = {} ;
    async.each(results,
        function(item, cb) {
            playerParams.Key.playerID = item.playerID ;
            docClient.get(playerParams, function(err, data) {
                if (err) {
                    console.error(err) ;
                } else {
                	playerMap[item.playerID] = data.Item.firstName + " " + data.Item.lastName ;
                }
                
                cb() ;               
            });
            
        }, function(err) {
        	callback(null, results, playerMap) ;
        }
    ) ;
}

/*
 * Calling function.  Chained to get homerun data for specific
 * range followed by player name lookup using playerID
 */
(function() {
    async.waterfall([ 
        homeruns,
        playerLookup
    ], function(error, nr, players) {

	nr.sort(function(a,b) { return b.HR - a.HR ; } ) ;
        for (var i = 0; i < nr.length; i++) {
    	    console.log(nr[i].HR + " -  " + players[nr[i].playerID]+ ", " + nr[i].yearID) ;
        }
    })
})() ;