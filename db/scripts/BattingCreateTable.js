var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  endpoint: "http://localhost:8000"
});

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
    ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits:1 },
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
        ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits:1 },
      }
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
