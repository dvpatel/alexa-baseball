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

var dataFile = "../data/Batting.csv" ;

console.log("Importing batting data into DynamoDB. Please wait.");

var rs = fs.createReadStream(dataFile);
var parser = parse({
    columns : true,
    delimiter : ','
}, function(err, data) {

    var split_arrays = []; 
    var size = 25;
    while (data.length > 0) {
        split_arrays.push(data.splice(0, size));
    }

    async.each(split_arrays, function(item_data, callback) {

        var items = [] ;
      
        //  pre-process
	for (var i = 0; i < item_data.length; i++) {
            var b = item_data[i] ;

            var batting = {} ;
	    batting["naturalID"] = uuid() ;
            batting.playerID = b.playerID ;
            batting.yearID = parseInt(b.yearID) || 0 ;

            batting.HR = parseInt(b.HR) || 0 ;
            batting.RBI = parseInt(b.RBI) || 0 ;
            batting.R = parseInt(b.R) || 0 ;
            batting.SB = parseInt(b.SB) || 0 ;

            /*
            batting.stint = parseInt(b.stint) || 0 ;
            batting.AB = parseInt(b.AB) || 0 ;
            batting.G = parseInt(b.G) || 0 ;
            batting.H = parseInt(b.H) || 0 ;
            batting["2B"] = parseInt(b["2B"]) || 0 ;
            batting["3B"] = parseInt(b["3B"]) || 0 ;
            batting.CS = parseInt(b.CS) || 0 ;
            batting.BB = parseInt(b.BB) || 0 ;
            batting.SO = parseInt(b.SO) || 0 ;
            batting.IBB = parseInt(b.IBB) || 0 ;
            batting.HBP = parseInt(b.HBP) || 0 ;
            batting.SH = parseInt(b.SH) || 0 ;
            batting.SF = parseInt(b.SF) || 0 ;
            batting.GIDP = parseInt(b.GIDP) || 0 ;
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

        docClient.batchWrite(params, function(err, data) {
            if (err) {
                console.log(err) ;
            } 
        });

        callback();

    }, function() {
        console.log("Batting data imported....");
    });

});

rs.pipe(parser);
