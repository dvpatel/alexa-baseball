var AWS = require("aws-sdk");

AWS.config.update({
  endpoint: "http://localhost:8000",
  region: "us-east-1"
});

var dynamodb = new AWS.DynamoDB();

/*
 * Create Teams table (Teams.csv)
 * Partition Key:  teamID;  Range Key:  yearID
 * 
 */
var params = {
    TableName : "Teams",
    KeySchema: [       
        { AttributeName: "teamID", KeyType: "HASH"},  //Partition key
        { AttributeName: "yearID", KeyType: "RANGE"},  //Partition key        
        ],
    AttributeDefinitions: [       
        { AttributeName: "teamID", AttributeType: "S" },
        { AttributeName: "yearID", AttributeType: "N" },
        ],
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
};

/*
 * Create Teams Table
 */
dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.log(err) ;
    } else {
        console.log(data) ;
    }
});
