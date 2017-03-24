/*
 * Import players data from data/Master.csv file
 */

var fs = require('fs');

var nconf = require('nconf') ;
nconf.file({file: 'db-config.json'}) ;

var AWS = require("aws-sdk");
AWS.config.update(nconf.get("aws-config"));
 
var parse = require('csv-parse');
var async = require('async');

var docClient = new AWS.DynamoDB.DocumentClient();

var dataFile = nconf.get("players-data") ;

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
             * playerID,birthYear,birthMonth,birthDay,birthCountry,birthState,birthCity,
             * deathYear,deathMonth,deathDay,deathCountry,deathState,deathCity,
             * nameFirst,nameLast,nameGiven,
             * weight,height,bats,throws,debut,finalGame,retroID,bbrefID
             */
            var player = {}  ;
            player.playerID = p.playerID ;
            player.firstName = (p.nameFirst || "NO_DATA").toLowerCase() ;
            player.lastName = (p.nameLast || "NO_DATA").toLowerCase() ;
            player.givenName = (p.nameGiven || "NO_DATA").toLowerCase() ;
            
            player.birthYear = parseInt(p.birthYear) || 9999 ;
            player.birthMonth = parseInt(p.birthMonth) || 0 ;
            player.birthDay = parseInt(p.birthDay) || 0 ;
            player.birthCountry = p.birthCountry || "NO_DATA" ;
            player.birthState = p.birthState || "NO_DATA" ;
            player.birtyCity = p.birthCity || "NO_DATA" ;            
            
            player.deathYear = parseInt(p.deathYear) || 0 ;
            player.deathMonth = parseInt(p.deathMonth) || 0 ;
            player.deathDay = parseInt(p.deathDay) || 0 ;
            player.deathCountry = p.deathCountry || "NO_DATA" ;
            player.deathState = p.deathState || "NO_DATA" ;
            player.deathCity = p.deathCity || "NO_DATA" ;            
            
            player.weight = parseInt(p.weight) || 0 ;
            player.height = parseInt(p.height) || 0 ;

            player.bats = p.bats || "NO_DATA" ;
            player.throws = p.throws || "NO_DATA" ;

            player.debut = p.debut || "1800-01-01" ;  //  1957-04-16,1968-09-29
            player.finalGame = p.finalGame || "1800-01-01" ;  //1957-04-16,1968-09-29

            //console.log(player) ;

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


        var bwCallback = function(err, data) {
            if (err) {
                console.log(err) ;
            } else {

               /*
                *  Logic for batch retry
                */
               if (!(Object.keys(data.UnprocessedItems).length === 0)) {
                   var params = {};
                   params.RequestItems = data.UnprocessedItems;
                   console.log("Retry...") ;
                   console.log(JSON.stringify(params)) ;
                   docClient.batchWrite(params, bwCallback);
               }
            }
        }

        /*
         * Batch import blocks of data for teams
         */
        docClient.batchWrite(params, bwCallback) ;


        /*
         * Signal async ops completed.
         */
        callback();

    }, function() {
        console.log("Players data imported....");
    });

});

rs.pipe(parser);
