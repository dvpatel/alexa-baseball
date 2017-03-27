/*
 *   Application utility.
 */

var async = require('async');
var dbm = require('dbutil');

module.exports = function(awsConfig) {

	var dbutil = dbm(awsConfig) ;
	var module = {} ;

	/*
	 * Lookup player by first and last name ;
	 */
	module.playerLookupByName = function(inpFirstname, inpLastname, appCallback) {	

		if (!inpLastname) {
			var error = "ERROR:  Please provide first and last name." ;
			appCallback(error, null) ;		
			return ;
		}
				
		playerLookupByName(inpFirstname, inpLastname, appCallback);
	}
	
	/*
	 * Return top stat for a given date start and end year range
	 */
	module.maxStatByYears = function(startYear, endYear, fkey, appCallback) {
		
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
		
		function statsData(callback) {
		    var yrRange = [] ;
		    var n = endYear - startYear ; 

		    for (var i = 0; i < n; i++) {
		    	yrRange.push(endYear - i) ;	
		    }

		    var fval = 0 ;
		    var results = [] ;
		    async.eachSeries(yrRange,
		        function(yr, cb) {		
		    		var xval = fval ;		    		
		            dbutil.topStatsByYear(yr, fkey, xval, function(err, data) {
		                if (err) {
		                    console.error(err) ;
		                } else {		                	
		                	if (data.Items.length > 0) {		                		
		                		//  results are sorted ;
		                		results.push(data.Items[0]) ;
		                		fval = data.Items[0][fkey] ;		                		
		                	}		                	
		                }
		                
		                cb() ;
		            }) ;

		        }, 
		        function(err) {
		        	callback(null, results) ;
		        }
		    ) ;
		}
		
	    async.waterfall([ 
	        statsData,
	        playerLookup,
	        teamNameLookup
	    ], function(error, nr) {
	    	
	    	//  Sort the results and return ;
	    	nr.sort(function(a,b) { return b[fkey] - a[fkey] ; } ) ;	    		    	
	    	appCallback(error, nr) ;
	    	
	    }) ;		
	}

	/*
	 * Get batting stats for a player using first and last name and year;
	 */
	module.battingStatsByPlayer = function(inpFirstname, inpLastname, appCallback) {	

		if (!inpFirstname || !inpLastname) {
			var error = "ERROR:  Please provide first and last name." ;
			appCallback(error, null) ;		
			return ;
		}

		function lookupPlayer(callback) {
			playerLookupByName(inpFirstname, inpLastname, function(err, data) {							
		        if (err) {
		            console.error(err) ;
		        } else {		        	
		        	
		        	//  Could be more than 1 player with same name ;  For now, return first found player;  Later, make interactive
		        	if (data.length > 0) {
			        	callback(null, data[0]) ;		        		
		        	} else {
		    			var error = "ERROR:  Cannot find playerID for " + inpFirstname + " " + inpLastname  ;
		    			callback(error, null) ;
		        	}		        	
		        }				
			}) ;	 
			
		}

		function lookupBattingStats(inp, callback) {
			var pid = inp.playerID ;		
			dbutil.battingStatsByPlayer(pid, function(err, data) {
		        if (err) {
		            console.error(err) ;
		        } else {
		        	callback(null, data.Items) ;
		        }				
			}) ;			
		}
		
	    async.waterfall([ 
	        lookupPlayer,
	        lookupBattingStats,
	        teamNameLookup
	    ], function(error, result) {	    	
	    	appCallback(error, result) ;	    	
	    }) ;   
	}	
	
	/*
	 * Get batting stats for a player using first and last name and year;
	 */
	module.battingStatsByYearByPlayer = function(inpFirstname, inpLastname, inpYear, appCallback) {	

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
		        	if (data.length > 0) {
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
			dbutil.battingStatsByPlayerByYear(pid, inpYear, 25, function(err, data) {
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
