var async = require('async');

var nconf = require('nconf') ;
nconf.file({file: 'config.json'}) ;

var awsConfig = nconf.get('aws-config') ;
var apputilmod = require('./my_modules/apputil') ;
var apputil = apputilmod(awsConfig) ;

/*
 *  Lambda handler for homerunking
 */
exports.handler = function(event, context, callback) {

    var evt = event ;
	apputil.maxHomerunByYears(evt.startYear, evt.endYear, function(err, data) {		
		if (err) {
		    callback(new Error(err));
		} else {
	        for (var i = 0; i < data.length; i++) {

	    	    var hr = data[i].HR ;
	    	    var fullName = data[i].fullName ;
	    	    var yearID = data[i].yearID ;
	    	    var teamName = data[i].franchiseName ;

	    	    console.log(hr + " -  " + fullName+ ", " + yearID + ", " + teamName ) ;	    	    
	        }
	        
	        callback(null, "Success") ;
		}				
	}) ;	
};
