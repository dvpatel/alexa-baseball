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
        { AttributeName: "naturalID", KeyType: "HASH"},
        { AttributeName: "playerID", KeyType: "RANGE" }
    ],
    AttributeDefinitions: [       
        { AttributeName: "naturalID", AttributeType: "S" },
        { AttributeName: "playerID", AttributeType: "S" },
        { AttributeName: "yearID", AttributeType: "N" },
        { AttributeName: "HR", AttributeType: "N" },
    ],
    ProvisionedThroughput: {ReadCapacityUnits: 5, WriteCapacityUnits:5 },
    GlobalSecondaryIndexes: [
      {
        IndexName : "HomerunsIndex",
        KeySchema : [
            { AttributeName: "yearID", KeyType: "HASH"},
            { AttributeName: "HR", KeyType: "RANGE" }
        ],
        Projection: {
            ProjectionType: "ALL"
        },
        ProvisionedThroughput: {ReadCapacityUnits: 5, WriteCapacityUnits:5 },
      },
      {
          IndexName : "HomerunsByPlayerIndex",
          KeySchema : [
              { AttributeName: "playerID", KeyType: "HASH"},
              { AttributeName: "yearID", KeyType: "RANGE" }
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
        console.log("Created table:  Batting.");
    }
});
