/*
 *  node StatsKingForYearIntentTest "home runs" 1989 1992
 */

var async = require('async');

var nconf = require('nconf') ;
nconf.file({file: 'config.json'}) ;

var awsConfig = nconf.get('aws-config') ;
var apputilmod = require('apputil') ;
var apputil = apputilmod(awsConfig) ;

/*
 * Set start and end year with defaults 1989  1995
 */

//var fkey = process.argv[2] || "HR" ;
//var startYear = (process.argv[3] || 2000)-0 ;
//var endYear = (process.argv[4] || 2005)-0 ;

var fkey = process.argv[2] 
var startYear = process.argv[3] ;
var endYear = process.argv[4] ;

console.log(startYear + ", " + endYear + ", " + fkey) ;

(function() {	
	apputil.maxStatByYears(startYear, endYear, fkey, function(err, data) {
		if (err) {
			console.error(err) ;
		} else {

			//console.log(data) ;

	    		var xval = apputil.battingUtil(data, data.statKey) ;
	    	    	var fullName = data[0].fullName ;
	    	    	var yearID = data[0].yearID ;
	    	    	var teamName = data[0].name ;
	                var result = fullName + " had the most " + data.statName + " at " + xval + " in " + yearID + ".  He was playing for " + teamName;
	    		console.log(result) ;
		}

	}) ;
})() ;
