var nconf = require('nconf') ;
nconf.file({file: 'db-config.json'}) ;

var AWS = require("aws-sdk");
AWS.config.update(nconf.get("aws-config"));

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
        { AttributeName: "yearID", KeyType: "RANGE"},  //Range key        
        ],
    AttributeDefinitions: [       
        { AttributeName: "teamID", AttributeType: "S" },
        { AttributeName: "yearID", AttributeType: "N" },
        ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
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
