/*
 *  node PlayersSearch Ortiz
 *  Find player given last name
 */

var async = require('async');

var nconf = require('nconf') ;
nconf.file({file: 'config.json'}) ;

var awsConfig = nconf.get('aws-config') ;
var apputilmod = require('./my_modules/apputil') ;
var apputil = apputilmod(awsConfig) ;


/*
 * Input last name
 */
var inpLastname = (process.argv[2] || "Ortiz") ;

(function() {	

	apputil.playerLookupByName(inpLastname, function(err, data) {
	    if (err) {
	        console.error(err) ;
	    } else {
	    	for (var i = 0; i < data.length; i++ ) {
	    		var player = data[i] ;
	            console.log(player.firstName + " " + player.lastName + " - " + player.birthYear) ;
	    	}
	    }
	}) ;
	
})() ;