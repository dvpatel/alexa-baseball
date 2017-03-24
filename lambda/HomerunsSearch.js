/*
 *   node HomerunsSearch 1975 25
 *   Get list of players with given HR for a given YEAR in HR order
 */

//  DB utility for homerns lookup
var async = require('async');

var nconf = require('nconf') ;
nconf.file({file: 'config.json'}) ;

var awsConfig = nconf.get('aws-config') ;
var apputilmod = require('./my_modules/apputil') ;
var apputil = apputilmod(awsConfig) ;

/*
 * Input with default of 2016 20 home runs
 */
var inpYear = (process.argv[2] || 2016)-0 ;
var inpHR = (process.argv[3] || 20)-0 ;


/*
 * Calling function to get players with inputed home runs or more for inputed year
 */
(function() {

	apputil.topHomerunsForYear(inpYear, inpHR, function(err, hr_items) {
		if (err) {
			console.log(err) ;
		} else {
			for (var i = 0; i < hr_items.length; i++) {
				var data = hr_items[i] ;
				console.log(data.HR + " -  " + data.fullName+ ", " + data.yearID + ", " + data.name) ;
			}
		}
	}) ;

})()
