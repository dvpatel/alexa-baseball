/*
 *   node HomerunsSearch 1975 25
 *   Get list of players with given HR for a given YEAR in HR order
 */

var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

/*
 * First chained function to get home runs based on inputed values and results constraint
 */
exports.homeruns = function(year, hr, limit, callback) {

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
exports.topHomerunsByYear = function(yr, callback) {

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
exports.playerLookup = function(playerID, callback) {

    //  Players table parameters
    var params = {
        TableName : "Players",
        Key:{ playerID: playerID },
    } ;

    docClient.get(params, function(err, data) {
        if (!err) 
	    data.Item["fullName"] = data.Item.firstName + " " + data.Item.lastName ;
	
        callback(err, data) ;
    });
}


/*
 * Locate players by lastname
 */
exports.playerLookupByName = function(lastName, callback) {

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
exports.teamNameLookup = function(teamID, yearID, callback) {

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
