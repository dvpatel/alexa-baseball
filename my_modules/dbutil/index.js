var fs = require('fs');
var AWS = require('aws-sdk');

module.exports = function(awsConfig) {

AWS.config.update(awsConfig) ;
var docClient = new AWS.DynamoDB.DocumentClient();

var module = {} ;



/*
 * Batting stats by playerID
 */
module.battingStatsByPlayer = function(playerID, callback) {
    //  DB params
    var params = {
        TableName : "Batting",
        KeyConditionExpression: "playerID = :pid",
        ExpressionAttributeValues: {
            ":pid": playerID
        },
        ScanIndexForward: false
    } ;

    docClient.query(params, function(err, data) {
        callback(err, data) ;
    });   
}

/*
 * Batting stats by playerID and year
 */
module.battingStatsByPlayerByYear = function(playerID, yearID, limit, callback) {
    //  DB params
    var params = {
        TableName : "Batting",
        KeyConditionExpression: "playerID = :pid AND begins_with(yearIndx, :yid)",
        ExpressionAttributeValues: {
            ":pid": playerID,
            ":yid": yearID.toString()
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
module.topStatsByYear = function(yr, fkey, fval, callback) {

	//  DB params
    var params = {
        TableName : "Batting",
        IndexName : "StatsByYearIndex",
        KeyConditionExpression: "yearID = :yr" ,
        FilterExpression: fkey + " >= :fv",
        ExpressionAttributeValues: {
            ":yr": yr,
            ":fv":fval
        },
        ScanIndexForward: false,
        ProjectionExpression: fkey + ", playerID, yearID, teamID" 
    } ;

    docClient.query(params, function(err, data) {    	
    	data.Items.sort(function(a,b) { return b[fkey] - a[fkey] ; } ) ;
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
 * Lookup player by last name and first 2 letters of first name
 */
module.playerLookupByName = function(firstName, lastName, callback) {

	//  Get only first 2 chars of firstName ;	
	var sfn = firstName ;
	if (firstName) {
		sfn = firstName.substring(0,2) ;				
	}
	
    var params = {
        TableName : "Players",
        IndexName : "LastnameIndex"
    }
    
    if (firstName && lastName) {    	
        params.KeyConditionExpression = "lastName = :ln AND begins_with(firstName,:fn)" ;   
        params.ExpressionAttributeValues = { ":ln":lastName, ":fn":sfn } ;        
    } else if (!firstName && lastName) {    	
        params.KeyConditionExpression = "lastName = :ln" ;    	
        params.ExpressionAttributeValues = { ":ln":lastName } ;
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
