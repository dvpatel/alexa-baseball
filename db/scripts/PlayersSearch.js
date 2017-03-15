/*
 *  node PlayersSearch Ortiz
 *  Find player given last name
 */

var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

/*
 * Input last name
 */
var inpLastname = (process.argv[2] || "Ortiz") ;

/*
 * Search against Players table
 */
var params = {
    TableName : "Players",
    IndexName : "LastnameIndex",
    KeyConditionExpression: "lastName = :ln",
    ExpressionAttributeValues: {
         ":ln": inpLastname,
    },
}

docClient.query(params, function(err, data) {
    if (err) {
        console.error(err) ;
    } else {
        data.Items.forEach(function(player) {
           console.log(player.firstName + " " + player.lastName + " - " + player.birthYear) ;
        });
    }
});
