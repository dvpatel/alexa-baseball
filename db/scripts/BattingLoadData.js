/*
 * Script to batch load batting data from db/Batting.csv CSV file
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

//  Data file
var dataFile = nconf.get("batting-data") ;

console.log("Importing batting data into DynamoDB. Please wait.");

var rs = fs.createReadStream(dataFile);
var parser = parse({
    columns : true,
    delimiter : ','
}, function(err, data) {

	/*
	 * Take file data and break into block of 25 items.
	 * Needed for batch upload to Batting table
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
            var b = item_data[i] ;

            /*
             *playerID,yearID,stint,teamID,lgID,G,AB,R,H,2B,3B,HR,RBI,SB,CS,BB,SO,IBB,HBP,SH,SF,GIDP
             */
            var batting = {} ;
            batting["naturalID"] = uuid() ;  //  used for partition ID
            batting.playerID = b.playerID ;  //  range key
            batting.teamID = b.teamID ;  //  range key
            batting.yearID = parseInt(b.yearID) || 0 ;  // forcing imported data to be a number;  default to 0 if value is null or empty
            batting.stint = parseInt(b.stint) || 0 ;
            batting.leagueID = b.lgID || "NA" ;  //  NA is neither AL or NL ;

            batting.G = parseInt(b.G) || 0 ;  //  number of games played
            batting.AB = parseInt(b.AB) || 0 ;
            batting.R = parseInt(b.R) || 0 ;
            batting.H = parseInt(b.H) || 0 ;
            batting["2B"] = parseInt(b["2B"]) || 0 ;
            batting["3B"] = parseInt(b["3B"]) || 0 ;

            batting.HR = parseInt(b.HR) || 0 ;
            batting.RBI = parseInt(b.RBI) || 0 ;
            
            batting.SB = parseInt(b.SB) || 0 ;
            batting.CS = parseInt(b.CS) || 0 ;   //  Caught stealing
            batting.BB = parseInt(b.BB) || 0 ;   //  Walk, base on balls
            batting.SO = parseInt(b.SO) || 0 ;
            batting.IBB = parseInt(b.IBB) || 0 ;  //  Intentional base on balls allowed
            batting.HBP = parseInt(b.HBP) || 0 ;  //  Hit by pitch ;
            batting.SH = parseInt(b.SH) || 0 ;    //  Sacrifice hit
            batting.SF = parseInt(b.SF) || 0 ;    //  Sacrifice fly
            batting.GIDP = parseInt(b.GIDP) || 0 ;  //  Ground into double play

            /*
             * Calculated statistic ;
             */
            
            var xAB = batting.AB <= 0 ? 999999999999999:batting.AB ;            
            batting.BA = (batting.H/xAB).toFixed(3) || 0 ;  //  Batting average or AVG
            batting.OBP = ([(batting.H + batting.BB + batting.HBP) / ( xAB + batting.BB + batting.HBP + batting.SF )]-0).toFixed(3) || 0 ;
            batting.SLG = ([(batting.H + (2 * batting["2B"]) + (3 * batting["3B"]) + (4 * batting.HR) ) / xAB]-0).toFixed(3) || 0 ; //  Slugging AVG
            batting.OPS = (parseFloat(batting.OBP) + parseFloat(batting.SLG)).toFixed(3) ; //  on-base percentage plus slugging 
            
            //  Popular:  BA, HR, RBI, SLG, SB, OPS            
            //console.log(batting.BA + ", " + batting.RBI + ", " + batting.OBP + ", " + batting.SLG + ", " + batting.OPS) ;
            
            /*
             * dynamodb specific data structure
             */
            var item = {
               "PutRequest": {
                   "Item":batting
               }
            }
            items.push(item) ;
    	}

        var params = {
            RequestItems: {
                "Batting":items
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
                   console.log("Retry...") ;
                   var params = {};
                   params.RequestItems = data.UnprocessedItems;
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
        console.log("Batting data imported....");
    });

});

rs.pipe(parser);
