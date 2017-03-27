var nconf = require('nconf') ;
var AWS = require("aws-sdk");

nconf.file({file: 'db-config.json'}) ;
AWS.config.update(nconf.get("aws-config"));

var dynamodb = new AWS.DynamoDB();

/*
 * Setup Batting table
 * Partition Key:  NatualID based on UUID
 * Range Key:  PlayerID
 * 
 * GSI:
 * Partition Key:  YearID
 * Range Key:  HR (homeruns)
 */
var params = {
    TableName : "Batting",
    KeySchema: [       
        { AttributeName: "playerID", KeyType: "HASH" },
        { AttributeName: "yearIndx", KeyType: "RANGE"}
    ],
    AttributeDefinitions: [       
        { AttributeName: "playerID", AttributeType: "S" },
        { AttributeName: "yearIndx", AttributeType: "S" },
        { AttributeName: "yearID", AttributeType: "N" }
    ],
    ProvisionedThroughput: {ReadCapacityUnits: 5, WriteCapacityUnits:5 },
    GlobalSecondaryIndexes: [
      {
          IndexName : "StatsByYearIndex",
          KeySchema : [
              { AttributeName: "yearID", KeyType: "HASH"}
          ],
          Projection: {
              ProjectionType: "ALL"
          },
          ProvisionedThroughput: {ReadCapacityUnits: 5, WriteCapacityUnits:5 },
        },      
    ],
};

/*
 * Create dynamodb table.
 */

dynamodb.createTable(params, function(err, data) {
    if (err) {
	console.log(err) ;
    } else {
	console.log(data) ;
        console.log("Created table:  Batting.");
    }
});
