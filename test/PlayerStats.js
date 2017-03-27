/*
 *  node PlayerStats Babe Ruth
 *  Get lifetime stats for a player 
 */

var async = require('async');

var nconf = require('nconf') ;
nconf.file({file: 'config.json'}) ;

var awsConfig = nconf.get('aws-config') ;
var apputilmod = require('apputil') ;
var apputil = apputilmod(awsConfig) ;

var inpFirstname = (process.argv[2] || "Babe") ;
var inpLastname = (process.argv[3] || "Ruth") ;

(function() {	

	apputil.battingStatsByPlayer(inpFirstname.toLowerCase(), inpLastname.toLowerCase(), function(err, data) {
	    if (err) {
	        console.error(err) ;
	    } else {	    	

	    	//  sort ;
	    	data.sort(function (a, b) {
	    		return a.yearID - b.yearID;
	    	});
	    	
	    	var thr = 0 ;
	    	var trbi = 0 ;
	    	var tsb = 0 ;
	    	var tr = 0 ;
	    	for (var i = 0; i < data.length; i++) {
	    		var d = data[i] ;
	    		
	    		thr = thr + d.HR ;
	    		trbi = trbi + d.RBI ;
	    		tsb = tsb + d.SB ;
	    		tr = tr + d.R ;

	    	}
	    
	    	console.log(inpFirstname + " " + inpLastname + " career stats:  HR " + thr + ", RBI:  "+ trbi + ", SB:  " + tsb + ", Runs Scored:  " + tr) ;
	    	
	    }
	    
	}) ;
	
})() ;
