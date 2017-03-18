/*
 *   node HomerunsSearch 1975 25
 *   Get list of players with given HR for a given YEAR in HR order
 */

var fs = require('fs');
var AWS = require('aws-sdk');

module.exports = function(awsConfig) {

AWS.config.update(awsConfig) ;
var docClient = new AWS.DynamoDB.DocumentClient();

var module = {} ;

/*
 * First chained function to get home runs based on inputed values and results constraint
 */
module.homeruns = function(year, hr, limit, callback) {

    //  DB params
    var params = {
        TableName : "Batting",
        IndexName : "HomerunsIndex",
        KeyConditionExpression: "yearID = :yr and HR > :hr",
        ExpressionAttributeValues: {
            ":yr": year,
            ":hr": hr 
        },
        ScanIndexForward: false,
        Limit: limit || 25,
    } ;

    docClient.query(params, function(err, data) {
        callback(err, data) ;
    });
    
}


/*
 * First chained function to get home runs based on inputed values and results constraint
 */
module.topHomerunsByYear = function(yr, callback) {

    //  DB params
    var params = {
        TableName : "Batting",
        IndexName : "HomerunsIndex",
        KeyConditionExpression: "yearID = :yr",
        ExpressionAttributeValues: {
            ":yr": yr,
        },
        ScanIndexForward: false,
        Limit: 1,
    } ;

    docClient.query(params, function(err, data) {
        callback(err, data) ;
    });

}



/*
 * Locate player name based on playerID
 */
module.playerLookup = function(playerID, callback) {

    //  Players table parameters
    var params = {
        TableName : "Players",
        Key:{ playerID: playerID },
    } ;

    docClient.get(params, function(err, data) {

        if (!err)  {
	    data.Item["fullName"] = data.Item.firstName + " " + data.Item.lastName ;
            callback(err, data) ;
        } else {
            console.log("Error!.") ;
            callback("Error with player lookup.") ;
        }
	
    });
}


/*
 * Locate players by lastname
 */
module.playerLookupByName = function(lastName, callback) {

    var params = {
        TableName : "Players",
        IndexName : "LastnameIndex",
        KeyConditionExpression: "lastName = :ln",
        ExpressionAttributeValues: {
            ":ln": lastName,
        }
    }

    docClient.query(params, function(err, data) {
        callback(err, data) ;
    }) ;
}

/*
 * Function to locate player based on playerID
 */
module.teamNameLookup = function(teamID, yearID, callback) {

    //  Teams table parameters
    var params = {
        TableName : "Teams",
        Key:{
            teamID: teamID,
            yearID: yearID 
        },
    } ;

    docClient.get(params, function(err, data) {
        callback(err, data) ;
    });
}


return module ;

} ;
