var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName : "Batting",
    KeyConditionExpression: "playerID = :pid",
    //ExpressionAttributeNames:{
    //    "#pid": "playerID"
    //},
    ExpressionAttributeValues: {
         ":pid": "aaronha01"
    }
}

console.log("Scanning Batting table.");
docClient.query(params, onScan);

function onScan(err, data) {
    if (err) {
        console.error("Unable to find the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        //  console.log("Scan succeeded.");
        data.Items.forEach(function(batting) {
           console.log(batting.playerID + " " + batting.yearStintID + " - " + batting.teamID) ;
        });
    }
}
