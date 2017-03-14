var AWS = require("aws-sdk");

AWS.config.update({
  endpoint: "http://localhost:8000",
  region: "us-east-1"
});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "Players",
    KeySchema: [       
        { AttributeName: "playerID", KeyType: "HASH"},  //Partition key
    ],
    AttributeDefinitions: [       
        { AttributeName: "playerID", AttributeType: "S" },
        { AttributeName: "lastName", AttributeType: "S" },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    GlobalSecondaryIndexes: [
      {
        IndexName : "LastnameIndex",
        KeySchema : [
            { AttributeName: "lastName", KeyType: "HASH"},
        ],
        Projection: {
            ProjectionType: "ALL"
        },
        ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits:1 },
      }
    ],
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.log(err) ;
    } else {
        console.log(data) ;
    }
});
