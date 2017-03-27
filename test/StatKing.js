/*
 *  node StatKing [HR|AB|RBI] 1990 1995
 *  Find top HR hitters for given year range
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

var fkey = process.argv[2] || "HR" ;
var startYear = (process.argv[3] || 2000)-0 ;
var endYear = (process.argv[4] || 2010)-0 ;

(function() {	
	
	apputil.maxStatByYears(startYear, endYear, fkey, function(err, data) {
		
		if (err) {
			console.log(err) ;
		} else {
	    		var xval = data[0][fkey] ;
	    	    	var fullName = data[0].fullName ;
	    	    	var yearID = data[0].yearID ;
	    	    	var teamName = data[0].name ;
	    		console.log(xval + " -  " + fullName+ ", " + yearID + ", " + teamName ) ;	    	    
		}
	}) ;
})() ;
