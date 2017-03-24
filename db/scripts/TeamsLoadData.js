/*
 * Script to batch load teams data from db/Teams.csv CSV file
 */

var uuid=require('uuid/v4') ;
var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');

var nconf = require('nconf') ;
nconf.file({file: 'db-config.json'}) ;
 
var AWS = require("aws-sdk");
AWS.config.update(nconf.get("aws-config"));


var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Importing teams data into DynamoDB. Please wait.");

/*
 * Load Teams franchise data to create a map / lookup table between teamID and franchiseID.  
 * This mapping is necessary to lookup franchise name ;
 */

/*
var franFile = nconf.get("franchise-data") ;

var fmap = {} ;
fs.createReadStream(franFile).pipe(parse({ columns : true, delimiter : ','}, 
	function(err, data) {	
		for (var i = 0; i < data.length; i++) {
			var d = data[i] ;
			fmap[d["franchID"]] = d["franchName"] ;			
		}
	})
) ;
*/

//  Teams Data file
var teamsFile = nconf.get("teams-data") ;

var rs = fs.createReadStream(teamsFile);
var parser = parse({
    columns : true,
    delimiter : ','
}, function(err, data) {

	/*
	 * Take file data and break into block of 25 items.
	 * Needed for batch upload to Teams table
	 */
    var split_arrays = []; 
    var size = 25;
    while (data.length > 0) {
        split_arrays.push(data.splice(0, size));
    }

    /*
     * For each block item, prepare and import data into dynamodb
     */
    async.each(split_arrays, function(item_data, callback) {

    	var items = [] ;
      
        //  pre-process
    	for (var i = 0; i < item_data.length; i++) {

    		/*  yearID,lgID,teamID,franchID,divID,
    		 * Rank,G,Ghome,W,L,DivWin,WCWin,LgWin,WSWin,
    		 * R,AB,H,2B,3B,HR,BB,SO,SB,CS,HBP,SF,RA,ER,ERA,
    		 * CG,SHO,SV,IPouts,HA,HRA,BBA,SOA,E,DP,FP,name,
    		 * park,attendance,BPF,PPF,teamIDBR,teamIDlahman45,teamIDretro
    		 */

    		var t = item_data[i] ;
            
            var team = {} ;
            team["teamID"] = t.teamID ;
            team["yearID"] = parseInt(t.yearID) || 0;
            team["divID"] = t.divID || "NO_DATA" ;
            team["name"] = t.name || "NO_DATA" ;
            team["park"] = t.park || "NO_DATA" ;
            
            /*
             * dynamodb specific data structure
             */
            var item = {
               "PutRequest": {
                   "Item":team
               }
            }
            items.push(item) ;
    	}

        var params = {
            RequestItems: {
                "Teams":items
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
         * signal completion of async op
         */
        callback();

    }, function() {
        console.log("Teams data imported....");
    });

});

rs.pipe(parser);
