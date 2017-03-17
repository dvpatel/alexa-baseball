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
