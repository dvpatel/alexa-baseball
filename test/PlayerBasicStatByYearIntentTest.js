/*
 *  node PlayerBasicStatByYearIntentTest Derek Jeter 1995 "runs"
 *  Get home runs for a player from year
 */

var async = require('async');

var nconf = require('nconf') ;
nconf.file({file: 'config.json'}) ;

var awsConfig = nconf.get('aws-config') ;
var apputilmod = require('apputil') ;
var apputil = apputilmod(awsConfig) ;

var inpFirstname = ((process.argv[2]) ? process.argv[2]: "NO_FIRST_NAME").toLowerCase() ;
var inpLastname = ((process.argv[3]) ? process.argv[3]: "NO_FIRST_NAME").toLowerCase() ;
var basicStatName = ((process.argv[4]) ? process.argv[4]: "NO_STAT").toLowerCase() ;	    	
var inpYear = (process.argv[5]) ? process.argv[5]-0 : "NO_DATE" ;

(function() {	

	apputil.battingStatsByYearByPlayer(inpFirstname, inpLastname, inpYear, basicStatName, function(err, data) {
	    if (err) {
	        console.error(err) ;
	    } else {	    	
	    	for (var i = 0; i < data.length; i++) {
	    		var r = data[i] ;	    	    	
	    	    	var team = r.name ;	    	    		
	    	    	var results = [
	    	    	        "While playing for the " + team + " in " + inpYear + ", "  + inpFirstname + " " + inpLastname + " had " + r[data.statKey] + " " + data.statName,
			        inpFirstname + " " + inpLastname + " had " + r[data.statKey] + " " + data.statName + " in " + inpYear + ".  He was playing for the " + team,
	    	    	        "In " + inpYear + ", " + inpFirstname + " " + inpLastname + " had " + r[data.statKey] + " " + data.statName + " while playing for the " + team] ;

	    	    	var rindx = Math.floor(Math.random() * 3) + 0 ;	    	    		

	    	    	console.log(results[rindx]) ;
	    	}	    
	    }
	}) ;
})() ;
