/*
 *   Application utility.
 */

var async = require('async');
var dbm = require('dbutil');

/*
 * Memory cache
 */
const NodeCache = require( "node-cache" );
const memcache = new NodeCache();


/*
 * Test for caching ;
 */
var counter = 0 ;

module.exports = function(awsConfig) {

	var minYear = 1871 ;
	var maxYear = 2016 ; //  make it dynamic in the future ;
	var maxDateRange = 10;  //  max of 10 years ;
	
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
	module.maxStatByYears = function(startYear, endYear, basicStatName, appCallback) {
				
		function dvCheck(callback) {					
	        var r = isDateRangeValid(startYear, endYear) ;
	        if (!(r === true)) {
		        console.error("Date DV failure:  " + r) ;	        
				callback(r, null) ;
	        } else {
	        	callback() ;
	        }			
		}
		
		function statsData(callback) {
			
			//  check if basic stat name is available;
			var r = isBasicStatNameValid(basicStatName) ;
	        if (!(r === true)) {
				callback(r, null) ;
				return ;
	        } 			

		    var yrRange = [] ;
		    var n = endYear - startYear ; 

		    for (var i = 0; i < n; i++) {
		    	yrRange.push(endYear - i) ;	
		    }

		    var fkey = kv[basicStatName] ;
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
	    	dvCheck,
	        statsData,
	        playerLookup,
	        teamNameLookup
	    ], function(error, data) {
	    	if (!error) {	    		
	    		var fkey = kv[basicStatName] ;	    		
	    		data.statKey = fkey ;
	    		data.statName = sdef[fkey] ;	    		
	    		data.sort(function(a,b) { return b[fkey] - a[fkey] ; } ) ;
	    		
		    	appCallback(error, data) ;	    		
		    	
	    	} else {
		    	appCallback(error, null) ;	    		
	    	}	    	
	    }) ;		
	}

	/*
	 * Get batting stats for a player using first and last name and year;
	 */
	module.battingStatsByPlayer = function(inpFirstname, inpLastname, basicStatName, appCallback) {	

		function dvCheck(callback) {					

			/*
			 * If basicStatName is provided, check if valid ;
			 */
			if (basicStatName) {
				var r = isBasicStatNameValid(basicStatName) ;
		        if (!(r === true)) {
					callback(r, null) ;
		        } else {
		        	callback() ;
		        }
			} else {
				callback() ;
			}
	        
		}
		
		function lookupPlayer(callback) {
			playerLookupByName(inpFirstname, inpLastname, function(err, data) {							
		        if (err) {
		            console.error("Player lookup error:  " + err) ;
		            callback(err, null) ;
		        } else {		        	
		        	
		        	//  Could be more than 1 player with same name ;  For now, return first found player;  Later, make interactive
		        	if (data.length > 0) {			        	
		        		callback(null, data[0]) ;		        		
		        	} else {
		    			console.error("Cannot find playerID for " + inpFirstname + " " + inpLastname) ;		        		
		    			var error = "Cannot find player information.  Please try again." ;
		    			callback(error, null) ;
		        	}		        	
		        }				
			}) ;	 
			
		}

		function lookupBattingStats(inp, callback) {
			var pid = inp.playerID ;						    	
			var cacheKey = "batting."+pid ;			
			var cacheData = getCache(cacheKey) ;	
			if (cacheData) {
				console.log("Found data for " + cacheKey) ;
				callback(null, cacheData) ;
			} else {
				dbutil.battingStatsByPlayer(pid, function(err, data) {
			        if (err) {
			            console.error(err) ;
			        } else {			        	
			        	console.log("Adding player batting stat to cache:  " + cacheKey) ;
			        	cacheObject(cacheKey, data.Items) ;		        	
			        	callback(null, data.Items) ;		        	
			        }				
				}) ;			
			}
		}
		
	    async.waterfall([
	    	dvCheck,
	    	lookupPlayer,
	        lookupBattingStats,
	        teamNameLookup
	    ], function(error, data) {	   	    	
	    	if (!error) {
	    		
	    		if (basicStatName) {
		    		var fkey = kv[basicStatName] ;	    		
		    		data.statKey = fkey ;
		    		data.statName = sdef[fkey] ;	    			
	    		}
	    		
		    	data.sort(function (a, b) {
		    		return a.yearID - b.yearID;
		    	});
		    		    	
		    	appCallback(error, data) ;	    		    		
	    	} else {
		    	appCallback(error, null) ;	    		    		
	    	}	    		    	
	    }) ;   
	}	
	
	/*
	 * Get batting stats for a player using first and last name and year;
	 */
	module.battingStatsByYearByPlayer = function(inpFirstname, inpLastname, inpYear, basicStatName, appCallback) {	


		function dvCheck(callback) {					
	        var r = isDateValid(inpYear) ;
	        if (!(r === true)) {
		        console.error("Date DV failure:  " + r) ;	        
				callback(r, null) ;
	        } else {
	        	callback() ;
	        }			
		}

		function lookupPlayer(callback) {
			playerLookupByName(inpFirstname, inpLastname, function(err, data) {							
		        if (err) {
		            console.error(err) ;
		        } else {		        	
		        	if (data.length > 0) {
			        	callback(null, data[0]) ;		        		
		        	} else {
		    			console.error("Cannot find playerID for " + inpFirstname + " " + inpLastname) ;		        		
		    			var error = "Cannot find player information.  Please try again." ;
		    			callback(error, null) ;
		        	}		        	
		        }				
			}) ;	 
		}

		function statDataLookup(inp, callback) {		
			
			//  check if basic stat name is available;
			var r = isBasicStatNameValid(basicStatName) ;
	        if (!(r === true)) {
				callback(r, null) ;
				return ;
	        } 			

	        var fkey = kv[basicStatName] ;
			var pid = inp.playerID ;

			var cacheKey = "batting." + pid + "." + inpYear ;
			var cacheData = getCache(cacheKey) ;	
			if (cacheData) {
				console.log("Found cache data for " + cacheKey) ;
				callback(null, cacheData) ;
			} else {
				dbutil.battingStatsByPlayerByYear(pid, inpYear, 25, function(err, data) {
			        if (err) {
			            console.error(err) ;
			        } else {			        	
			        	console.log("Adding to cache:  " + cacheKey) ;
			        	cacheObject(cacheKey, data.Items) ;
			        	callback(null, data.Items) ;
			        }				
				}) ;						
			}			
		}
		
	    async.waterfall([ 
	    	dvCheck,
	    	lookupPlayer,
	    	statDataLookup,
	        teamNameLookup
	    ], function(error, data) {	 
	    	if (!error) {
	    		
	    		var fkey = kv[basicStatName] ;	    		
	    		data.statKey = fkey ;
	    		data.statName = sdef[fkey] ;
	    		
	    		if (data.length == 0) {
	    			error = "I could not find " + data.statName + " data for " + inpFirstname + " " + inpLastname + " for " + inpYear+ ".  Please try again.";
	    			data = null; 
	    		}	    		
	    		
		    	appCallback(error, data) ;	    				    	
	    	} else {	    		
		    	appCallback(error, null) ;	    		
	    	}	    	
	    	
	    }) ;   
	}
	
	/*
	 * Convert batting stats to 3 digits ;
	 */
	module.battingUtil = function(data, statKey) {

		var xval = data[0][statKey] ;
    	var y = ["BA", "SLG", "OBP", "OPS"];	    	    	
    	if (y.indexOf(statKey) != -1) {
    		xval = ((xval / data.length)/1000).toFixed(3) ;
    	}
    	return xval ;    	
	}
	
	module.getName = function(slot, slotKey) {		
		//var inpFirstname = ((slots.firstName) ? slots.firstName.value : "NO_FIRST_NAME").toLowerCase() ;
		
		if (slot && slot[slotKey] && slot[slotKey].value) {
			return slot[slotKey].value.toLowerCase() ;
		} else {
			console.error("Cannot get module.getName value for " + JSON.stringify(slot)) ;
			return "NO_"+slotKey ;
		}
		
	}

	module.getNumber = function(slot, slotKey) {				
        //var inpYear = (slots.playerYear) ? slots.playerYear.value-0 : "NO_DATE"
		
		if (slot && slot[slotKey] && slot[slotKey].value) {
			return slot[slotKey].value - 0 ;
		} else {
			console.error("Cannot get module.getNumber value for " + JSON.stringify(slot)) ;
			return "NO_" + slotKey ;
		}			
	}

	
	/*
	 * KV ;
	 */
	
	/*
	Batting Average (BA)
	Run Batted In (RBI)
	RBI
	Slugging Percentage (SLG)
	Slugging Average (SLG)
	Stolen Base (SB)
	Stolen Bases (SB)
	OBP (OBP)
	On base percentage (OBP)
	OPS (OPS)
	On base plus slugging (OPS)
	Runs (R)
	Runs Scored (R)
	Home Runs (HR)
	Dingers (HR)
	Homers (HR)
	Walks (BB)
	*/
	var kv = {
			"batting average":"BA",
			"run batted in":"RBI",
			"runs batted in":"RBI",	        		
			"rbi":"RBI",
			"slugging percentage":"SLG",
			"slugging average":"SLG",
			"stolen base":"SB",
			"stolen bases":"SB",
			"obp":"OBP",
			"on base percentage":"OBP",
			"ops":"OPS",
			"on base plus slugging":"OPS",
			"runs":"R",
			"runs scored":"R",
			"home runs":"HR",
			"homeruns":"HR",		
			"dingers":"HR",
			"homers":"HR",
			"walks":"BB",
			"walk":"BB",
			"strikeout":"SO",
			"strike out":"SO",
			"strikeouts":"SO",
			"strike outs":"SO",
			"singles":"H",
			"hits":"H",
			"doubles":"2B",
			"triples":"3B"
	}

	/*
	*  Stats Key Names
	*/
	var sdef = {
	"BA":"Batting Average",
	"RBI":"Runs Batted In",
	"SLG":"Slugging Percentage",
	"SB":"Stolen Bases",
	"OBP":"On Base Percentage",
	"OPS":"On Base Plus Slugging",
	"R":"Runs Scored",
	"HR":"Home Runs",
	"BB":"Walks",
	"SO":"Strike Outs",
	"H":"Singles",
	"2B":"Doubles",
	"3B":"Triples"
	}
	
	/*
	 * Check basic stat key values ;
	 */
	function isBasicStatNameValid(basicStatNameKey) {
		
        /*
         * Test if key and values exists ;
         */
        if (!kv.hasOwnProperty(basicStatNameKey) || !kv[basicStatNameKey]) {
        	console.error("Invalid request:  " + basicStatNameKey) ;
        	return "No such stat name.  Please try again." ;
        }
        
        return true ;        
	}


	/*
	 * string to int test and converter ;
	 */
	function filterInt(value) {
		if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
			return Number(value);

		return NaN;
	}
	
	
	/*
	 * Single date validation ;
	 */
	function isDateValid(inpYear) {

		//  Convert string to int ;
		inpYear = filterInt(inpYear) ;

		if (isNaN(inpYear)) {
			console.error("Invalid Number:  " + inpYear) ;			
			return "Invalid date.  Please try again with valid dates." ;
		}

		if (inpYear < minYear) {
			console.error("Year Error:  " + inpYear) ;			
			return "Baseball did not exisit before " + inpYear + ".  Please say a year after "+ minYear ;
		}
		
		if (inpYear > maxYear) {			
			console.error("Year Error:  " + inpYear) ;			
			return "Baseball will probably exist in the future.  For now, please say a year less than " + maxYear ;						
		}
		
		return true ;		
	}
	
	
	/*
	 * Date range data validation
	 */
	function isDateRangeValid(startYear, endYear) {
		
		//  Convert string to int ;
		startYear = filterInt(startYear) ;
		endYear = filterInt(endYear) ;
		
		var r1 = isDateValid(startYear) ;
		var r2 = isDateValid(endYear) ;
		
		if (!(r1 === true))
			return r1 ;
		
		if (!(r2 === true))
			return r2 ;
		
		
		//  minYear = 1871; maxYear = 2016 ;		
		if (startYear > endYear) {
			console.error("Year Error:  " + startYear + ", " + endYear) ;			
			return "Invalid date.  Please try again with valid dates." ;
		}
		
		//  Date range test.  Allow only max of 10 years to save on DynamoDB requests.
		if ((endYear - startYear) > maxDateRange) {			
			console.error("Max Year Error (" + maxDateRange +"):  " + startYear + ", " + endYear) ;
			return "Date range cannot be greater than 10 years.  Please try again." ;						
		}
		
		return true ;
	}
	
	/*
	 * Cache utility
	 */	
	function cacheObject(key, val) {
		memcache.set(key,val) ;
	}
	
	function getCache(key) {		
		return memcache.get(key) ;
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
	 * Validate player firstname and lastname ;
	 */
	function isPlayerNameValid(inpFirstname, inpLastname) {
		// PERSON NAME   ^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$

		
	}
	
	/*
	 * Lookup playerID by first and last name
	 */
	function playerLookupByName(inpFirstname, inpLastname, callback) {
		
		if (!inpFirstname || !inpLastname) {
			console.error("Error:  missing player name :  " + inpFirstname + ", " + inpLastname) ;
			var error = "No such player.  Please provide valid player name." ;
			callback(error, null) ;		
			return ;
		} else {
			var key = "player."+inpFirstname+"."+inpLastname ;
			var cacheData = getCache(key) ;
			if (cacheData) {				
				console.log("Found data in cache for key: " + key) ;
				callback(null, cacheData) ;				
			} else {
				dbutil.playerLookupByName(inpFirstname, inpLastname, function(err, data) {	
					
					if (!err) {
						console.log("Adding to cache:  " + key) ;					
						cacheObject(key, data.Items) ;										
					}
					
					callback(err, data.Items) ;									
				}) ;
			}			
		}		
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
