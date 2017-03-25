var nconf = require('nconf') ;
nconf.file({file: 'db-config.json'}) ;

var AWS = require("aws-sdk");
AWS.config.update(nconf.get("aws-config"));

var dynamodb = new AWS.DynamoDB();

/*
 * Create Players table
 * Partition Key:  player ID
 * 
 * GSI
 * Partition Key:  Last Name
 */
var params = {
    TableName : "Players",
    KeySchema: [       
        { AttributeName: "playerID", KeyType: "HASH"},  //Partition key
    ],
    AttributeDefinitions: [       
        { AttributeName: "playerID", AttributeType: "S" },
        { AttributeName: "lastName", AttributeType: "S" },
        { AttributeName: "firstName", AttributeType: "S" },        
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    GlobalSecondaryIndexes: [
      {
        IndexName : "LastnameIndex",
        KeySchema : [
            { AttributeName: "lastName", KeyType: "HASH"},
            { AttributeName: "firstName", KeyType: "RANGE"},
            ],
        Projection: {
            ProjectionType: "ALL"
        },
        ProvisionedThroughput: {ReadCapacityUnits: 5, WriteCapacityUnits:5 },
      }
    ],
};

/*
 * Create Players Table
 */
dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.log(err) ;
    } else {
        console.log(data) ;
    }
});
