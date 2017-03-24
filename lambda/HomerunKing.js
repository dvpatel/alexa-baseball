/*
 *  node HomerunKing 1990 1995
 *  Find top HR hitters for given year range
 */

var async = require('async');

var nconf = require('nconf') ;
nconf.file({file: 'config.json'}) ;

var awsConfig = nconf.get('aws-config') ;
var apputilmod = require('./my_modules/apputil') ;
var apputil = apputilmod(awsConfig) ;

/*
 * Set start and end year with defaults 2015  2016
 */
var startYear = (process.argv[2] || 2015)-0 ;
var endYear = (process.argv[3] || 2016)-0 ;

(function() {	
	
	apputil.maxHomerunByYears(startYear, endYear, function(err, data) {
		
		if (err) {
			console.log(err) ;
		} else {
	        for (var i = 0; i < data.length; i++) {

	    	    var hr = data[i].HR ;
	    	    var fullName = data[i].fullName ;
	    	    var yearID = data[i].yearID ;
	    	    var teamName = data[i].name ;

	    	    console.log(hr + " -  " + fullName+ ", " + yearID + ", " + teamName ) ;	    	    
	        }
		}
				
	}) ;
	
})() ;
