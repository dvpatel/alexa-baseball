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

var slot = {} ;
slot.firstName = {} ;
slot.lastName = {} ;
slot.basicStatName = {} ;
slot.playerYear = {} ;

slot.firstName.value = process.argv[2] ;
slot.lastName.value = process.argv[3] ;
slot.basicStatName.value = process.argv[4] ;
slot.playerYear.value = process.argv[5] ;

console.log(slot) ;

var inpFirstname = apputil.getName(slot, "firstName") ;
var inpLastname = apputil.getName(slot, "lastName") ;
var basicStatName = apputil.getName(slot, "basicStatName") ;
var inpYear = apputil.getNumber(slot, "playerYear") ;

(function() {	

	apputil.battingStatsByYearByPlayer(inpFirstname, inpLastname, inpYear, basicStatName, function(err, data) {
	    if (err) {
	        console.error(err) ;
	    } else {	    	
	    	
	    	console.log("Length:  " + data.length) ;
	    	
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

console.log("Done.") ;