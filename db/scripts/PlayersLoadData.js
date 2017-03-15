/*
 * Import players data from data/Master.csv file
 */

var AWS = require("aws-sdk");

var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');

AWS.config.update({
    region: "us-east-1",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var dataFile = "../data/Master.csv" ;

console.log("Importing players data into DynamoDB. Please wait.");

var rs = fs.createReadStream(dataFile);
var parser = parse({
    columns : true,
    delimiter : ','
}, function(err, data) {

	/*
	 *  Prepare data into blocks of 25 items
	 *  for DynamoDB batch import
	 */	
	var split_arrays = [];
    var size = 25;
    while (data.length > 0) {
        split_arrays.push(data.splice(0, size));
    }

    async.each(split_arrays, function(item_data, callback) {

        var items = [] ;

        /*
         * For each block, prepare data for import.
         */
        for (var i = 0; i < item_data.length; i++) {
            var p = item_data[i] ;

            /*
             * Using only selected attributes from players file
             * to save on AWS / DynamoDB network, storage, throughput costs
             */
            var player = {}  ;
            player.playerID = p.playerID ;
            player.firstName = p.nameFirst || "NO_DATA" ;
            player.lastName = p.nameLast ;
            player.givenName = p.nameGiven ;
            player.birthYear = parseInt(p.birthYear) || 9999 ;

	    /*
            player.birthMonth = parseInt(p.birthMonth) || 0 ;
            player.birthDay = parseInt(p.birthDay) || 0 ;
            player.deathYear = parseInt(p.deathYear) || 0 ;
            player.deathMonth = parseInt(p.deathMonth) || 0 ;
            player.deathDay = parseInt(p.deathDay) || 0 ;
            player.weight = parseInt(p.weight) || 0 ;
            player.height = parseInt(p.height) || 0 ;
            */

            for (var key in player) {
              if (player.hasOwnProperty(key)) {
                  player[key] = player[key] || null ;
              }
            }

            /*
             * Dynamodb constructs
             */
            var item = {
               "PutRequest": {
                   "Item":player
               }
            }

            items.push(item) ;
        }

        var params = {
            RequestItems: {
                "Players":items
            }
        } ;

        /*
         * Batch import players data
         */
        docClient.batchWrite(params, function(err, data) {
            if (err) {
                console.log("Error: " + err) ;
            }
        });

        /*
         * Signal async ops completed.
         */
        callback();

    }, function() {
        console.log("Players data imported....");
    });

});

rs.pipe(parser);
