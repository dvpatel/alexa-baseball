/*
 *   Application utility.
 */

var async = require('async');
var dbm = require('../dbutil');

module.exports = function(awsConfig) {

	var dbutil = dbm(awsConfig) ;
	var module = {} ;

	/*
	 * Lookup player by first and last name ;
	 */
	module.playerLookupByName = function(inpFirstname, inpLastname, appCallback) {	
		playerLookupByName(inpFirstname, inpLastname, appCallback);
	}

	/*
	 * Lookup player by last name ;
	 */
	module.playerLookupByLastName = function(inpLastname, appCallback) {	

		if (!inpLastname) {
			var error = "ERROR:  Please provide first and last name." ;
			appCallback(error, null) ;		
			return ;
		}
		
		dbutil.playerLookupByLastName(inpLastname, function(err, data) {
			appCallback(err, data.Items) ;		    	
		}) ;
	}	
	
	/*
	 * Find top homeruns hitter for a given year
	 */
	module.topHomerunsForYear = function(inpYear, inpHR, appCallback) {
		var currentTime = new Date()
		var currentYear = currentTime.getFullYear()
		if (inpYear > currentYear) {
			var error = "ERROR:  Current year is " + currentYear + ", not " + endYear + ".  Not there yet." ;
			appCallback(error, null) ;		
			return ;
		}

		if (inpYear < 1871) {
			var error = "ERROR:  Basbeall did not exisit before " + startYear + ".  Please enter value greater than 1871." ;
			appCallback(error, null) ;		
			return ;			
		}

		if (inpHR < 0 || inpHR > 100) {
			var error = "ERROR:  Please enter valid homeruns (more than 0, less than 100.)" ;
			appCallback(error, null) ;		
			return ;			
		}
		
		/*
		 * First chained function to get home runs based on inputed values and results constraint
		 */
		function homeruns(callback) {
		    
		    dbutil.homeruns(inpYear, inpHR, 15, function(err, data) {
		        if (err) {
		            console.error(err) ;
		        } else {
		        	callback(null, data.Items) ;
		        }
		    }) ;

		}
		
	    async.waterfall([ 
	        homeruns,
	        playerLookup,
	        teamNameLookup
	    ], function(error, data) {	    		    	
	    	appCallback(error, data) ;	    	
	    }) ;
	}
	
	
	/*
	 * Return top homeruns hitter for a given start and end year range
	 */
	module.maxHomerunByYears = function(startYear, endYear, appCallback) {
		
		if (startYear > endYear) {
			var error = "ERROR:  start year cannot be greater than end year." ;
			appCallback(error, null) ;
			return ;
		}

		// Return today's date and time
		var currentTime = new Date()
		var currentYear = currentTime.getFullYear()
		if (endYear > currentYear) {
			var error = "ERROR:  Current year is " + currentYear + ", not " + endYear + ".  Not there yet." ;
			appCallback(error, null) ;		
			return ;
		}
		
		if (startYear < 1871) {
			var error = "ERROR:  Basbeall did not exisit before " + startYear + ".  Please enter value greater than 1871." ;
			appCallback(error, null) ;		
			return ;			
		}
		
		function homeruns(callback) {
		    var yrRange = [] ;
		    var n = endYear - startYear ; 

		    for (var i = 0; i < n; i++) {
		    	yrRange.push(endYear - i) ;	
		    }

		    var results = [] ;
		    async.each(yrRange,
		        function(yr, cb) {

		            dbutil.topHomerunsByYear(yr, function(err, data) {
		                if (err) {
		                    console.error(err) ;
		                } else {
				    if (data.Items.length > 0) {
			                results.push(data.Items[0]) ;
		                    }
		                }
		                cb() ;
		            }) ;

		        }, function(err) {
			    callback(null, results) ;
			}
		    ) ;
		}
		
	    async.waterfall([ 
	        homeruns,
	        playerLookup,
	        teamNameLookup
	    ], function(error, nr) {
	    	
	    	//  Sort the results and return ;
	    	nr.sort(function(a,b) { return b.HR - a.HR ; } ) ;	    		    	
	    	appCallback(error, nr) ;
	    	
	    }) ;		
	}
	
	
	/*
	 * Get home runs for a player using first and last name and year;
	 */
	module.homerunsByYearByPlayer = function(inpFirstname, inpLastname, inpYear, appCallback) {	

		if (!inpFirstname || !inpLastname) {
			var error = "ERROR:  Please provide first and last name." ;
			appCallback(error, null) ;		
			return ;
		}

		if (!inpYear) {
			var error = "ERROR:  Please provide valid year." ;
			appCallback(error, null) ;		
			return ;
		}
		
		function lookupPlayer(callback) {
			playerLookupByName(inpFirstname, inpLastname, function(err, data) {							
		        if (err) {
		            console.error(err) ;
		        } else {		        	
		        	if (data.length > 0 && data[0].playerID) {
			        	callback(null, data[0]) ;		        		
		        	} else {
		    			var error = "ERROR:  Cannot find playerID for " + inpFirstname + " " + inpLastname  ;
		    			callback(error, null) ;
		        	}		        	
		        }				
			}) ;	 
		}

		function lookupHomeruns(inp, callback) {			
			var pid = inp.playerID ;			
			dbutil.homerunsByPlayerByYear(pid, inpYear, 10, function(err, data) {
		        if (err) {
		            console.error(err) ;
		        } else {
		        	callback(null, data.Items) ;
		        }				
			}) ;			
		}
		
	    async.waterfall([ 
	        lookupPlayer,
	        lookupHomeruns,
	        teamNameLookup
	    ], function(error, result) {	    	
	    	appCallback(error, result) ;	    	
	    }) ;   
	}
	
	/*
	 * function to lookup team name based on playerID and yearID 
	 */
	function teamNameLookup(hr_items, callback) {				
	    var r = {} ;
	    async.each(hr_items,
	        function(item, cb) {
	            dbutil.teamNameLookup(item.teamID, item.yearID, function(err, data) {
	                if (err) {
	                    console.error(err) ;
	                } else {	                	
	                	item.name = data.Item.name ;	                    
	                }
	                cb() ;
	            }) ;
	        }, function(err) {
	                callback(null, hr_items) ;
	        }
	    ) ;
	}
	
	
	/*
	 * Lookup playerID by first and last name
	 */
	function playerLookupByName(inpFirstname, inpLastname, callback) {
		
		if (!inpFirstname || !inpLastname) {
			var error = "ERROR:  Please provide first and last name." ;
			appCallback(error, null) ;		
			return ;
		}
		
		dbutil.playerLookupByName(inpFirstname, inpLastname, function(err, data) {
			callback(err, data.Items) ;		    	
		}) ;
	}

	
	/*
	 * for each playerID, lookup player name from Players table
	 */
	function playerLookup(results, callback) {

	    async.each(results,
	        function(item, cb) {
	            dbutil.playerLookup(item.playerID, function(err, data) {
	                if (err) {
	                    console.error(err) ;
	                } else {
	                    item.fullName = data.Item.fullName ;
	                }
	                cb() ;               
	            }) ;
	        }, function(err) {
	            callback(null, results) ;
	        }
	    ) ;
	}

	return module ;
} ;
