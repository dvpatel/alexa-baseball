var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  endpoint: "http://localhost:8000"
});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "Batting",
    KeySchema: [       
        { AttributeName: "naturalID", KeyType: "HASH"},  //Partition key
        { AttributeName: "playerID", KeyType: "RANGE" }  //Sort key
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
            ProjectionType: "KEYS_ONLY"
        },
        ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits:1 },
      }
    ],
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
	console.log(err) ;
    } else {
        console.log("Created table:  Batting.");
    }
});
