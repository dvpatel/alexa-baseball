/*
 *  node PlayerHomeruns Derek Jeter 1995
 *  Get home runs for a player from year
 */

var async = require('async');

var nconf = require('nconf') ;
nconf.file({file: 'config.json'}) ;

var awsConfig = nconf.get('aws-config') ;
var apputilmod = require('./my_modules/apputil') ;
var apputil = apputilmod(awsConfig) ;

var inpFirstname = (process.argv[2] || "David") ;
var inpLastname = (process.argv[3] || "Ortiz") ;
var inpYear = (process.argv[4] || 2005)-0 ;

(function() {	

	apputil.homerunsByYearByPlayer(inpFirstname.toLowerCase(), inpLastname.toLowerCase(), inpYear, function(err, data) {
	    if (err) {
	        console.error(err) ;
	    } else {	    	
	    	var thr = 0 ;
	    	for (var i = 0; i < data.length; i++) {
	    		var r = data[i] ;
	    		thr = thr + r.HR ;	    		
	    	}
	    	
	    	console.log("Total Homeruns:  " + thr + ", Year:  " + inpYear + " by " + inpFirstname + " " + inpLastname) ;
	    	
	    }
	}) ;
	
})() ;
