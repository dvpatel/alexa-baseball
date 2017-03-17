/*
 * Script to batch load teams data from db/Teams.csv CSV file
 */

var uuid=require('uuid/v4') ;
var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');

var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-1",
    endpoint: "http://localhost:8000"
});
var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Importing teams data into DynamoDB. Please wait.");

/*
 * Load Teams franchise data to create a map / lookup table between teamID and franchiseID.  
 * This mapping is necessary to lookup franchise name ;
 */
var franFile = "../data/TeamsFranchises.csv" ;
var fmap = {} ;
fs.createReadStream(franFile).pipe(parse({ columns : true, delimiter : ','}, 
	function(err, data) {	
		for (var i = 0; i < data.length; i++) {
			var d = data[i] ;
			fmap[d["franchID"]] = d["franchName"] ;			
		}
	})
) ;

//  Teams Data file
var teamsFile = "../data/Teams.csv" ;
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
    		
    		//yearID,teamID,franchID
    		
            var t = item_data[i] ;
            
            var team = {} ;
            team["teamID"] = t.teamID ;
            team["yearID"] = parseInt(t.yearID) || 0;
            team["franchiseID"] = t.franchID ;
            team["franchiseName"] = fmap[t.franchID] ;
                        
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

        /*
         * Batch import blocks of data for teams
         */
        docClient.batchWrite(params, function(err, data) {
            if (err) {
                console.log(err) ;
            } 
        });

        /*
         * signal completion of async op
         */
        callback();

    }, function() {
        console.log("Teams data imported....");
    });

});

rs.pipe(parser);