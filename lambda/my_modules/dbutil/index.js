var fs = require('fs');
var AWS = require('aws-sdk');

module.exports = function(awsConfig) {

AWS.config.update(awsConfig) ;
var docClient = new AWS.DynamoDB.DocumentClient();

var module = {} ;

/*
 * Get home runs given year and hr conditions
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
 * Home runs by playerID and year
 */
module.homerunsByPlayerByYear = function(playerID, yearID, limit, callback) {
    //  DB params
    var params = {
        TableName : "Batting",
        IndexName : "HomerunsByPlayerIndex",
        KeyConditionExpression: "playerID = :pid and yearID = :yid",
        ExpressionAttributeValues: {
            ":pid": playerID,
            ":yid": yearID 
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
 * Lookup player based on playerID
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
 * Lookup player by first and / or last name
 */
module.playerLookupByName = function(firstName, lastName, callback) {

    var params = {
        TableName : "Players",
        IndexName : "LastnameIndex",
        KeyConditionExpression : "",
        ExpressionAttributeValues: {
            ":ln": lastName,
            ":fn": firstName
        }
    }
    
    if (firstName && lastName) {
        params.KeyConditionExpression = "lastName = :ln and firstName = :fn" ;    	
    } else if (!firstName && lastName) {    	
        params.KeyConditionExpression = "lastName = :ln" ;    	
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
