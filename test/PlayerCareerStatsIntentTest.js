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

var slot = {} ;
slot.firstName = {} ;
slot.lastName = {} ;
slot.basicStatName = {} ;


slot.firstName.value = process.argv[2] ;
slot.lastName.value = process.argv[3] ;
slot.basicStatName.value = process.argv[4] ;

console.log(slot) ;

var inpFirstname = apputil.getName(slot, "firstName") ;
var inpLastname = apputil.getName(slot, "lastName") ;
var basicStatName = apputil.getName(slot, "basicStatName") ;


(function() {	

	//  fn, ln, null -->  all stats
	apputil.battingStatsByPlayer(inpFirstname, inpLastname, basicStatName, function(err, data) {
	    if (err) {
	        console.error(err) ;
	    } else {	    	

	    	var thr = 0 ;
	    	var trbi = 0 ;
	    	var tba = 0 ;
	    	var tops = 0 ;
	    	for (var i = 0; i < data.length; i++) {
	    		var d = data[i] ;
	    		thr = thr + d.HR ;	    	    		
	    		trbi = trbi + d.RBI ;	    	    		
	    		tba = tba + d.BA ;
	    		tops = tops + d.OPS ;
	    	}
	    
    		tba = ((tba / data.length)/1000).toFixed(3) ;
    		tops = ((tops / data.length)/1000).toFixed(3) ;
	    	
	    	var result = "Here are the career stats for " + inpFirstname + " " + inpLastname + " : " +
	    	"total home runs " + thr + ", total batting average " + tba + ", total R.B.I. was " + trbi +
	    	" and total O.P.S. was " + tops ;	    	    	
	    	
	    	console.log("StatKey:  " + data.statKey) ;
	    	console.log("StatName:  " + data.statName) ;
	    	
	    	console.log(result) ;	    	
	    }
	    
	}) ;
	
})() ;
