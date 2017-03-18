var async = require('async');
var nconf = require('nconf') ;
nconf.file({file: 'config.json'}) ;
var dbutil = require('./my_modules/dbutil')(nconf.get('aws-config')) ;

/*
 * Chain 1:  get home runs and playerID for given range
 */

function homeruns(evt) {
	return function(callback) {
		
		var startYear = (evt.startYear || 2015)-0 ;
		var endYear = (evt.endYear || 2016)-0 ;

		var yrRange = [] ;
		var n = endYear - startYear ; 

		for (var i = 0; i < n; i++) {
			yrRange.push(endYear - i) ;	
		}

		var results = [] ;
		async.each(yrRange, function(yr, cb) {

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
			callback(null, evt, results) ;
		}) ;
	} ;
}

/*
 * Chain 2:  for each playerID, lookup player name from Players table
 */
function playerLookup(evt, results, callback) {

    async.each(results,
        function(item, cb) {
            dbutil.playerLookup(item.playerID, function(err, data) {
                if (err) {
                    console.error(err) ;
                } else {
                    item.fullName = data.Item.fullName ;
                }
            }) ;
            cb() ;               
        }, function(err) {
            callback(null, evt, results) ;
        }
    ) ;
}

/*
 * Chain 3:  function to lookup team name based on playerID and yearID 
 */
function teamNameLookup(evt, hr_items, callback) {
    var r = {} ;
    async.each(hr_items,
        function(item, cb) {
            dbutil.teamNameLookup(item.teamID, item.yearID, function(err, data) {
                if (err) {
                    console.error(err) ;
                } else {
                    item.franchiseName = data.Item.franchiseName ;
                }
                cb() ;
            }) ;

        }, function(err) {
                callback(null, hr_items) ;
        }
    ) ;
}


/*
 *  Lambda handler for homerunking
 */
exports.handler = function(event, context, callback) {

    var evt = event ;
    async.waterfall([ 
        homeruns(evt),
        playerLookup,
        teamNameLookup
    ], function(error, nr) {

    	nr.sort(function(a,b) { return b.HR - a.HR ; } ) ;
        for (var i = 0; i < nr.length; i++) {

        	var hr = nr[i].HR ;
        	var fullName = nr[i].fullName ;
            var yearID = nr[i].yearID ;
            var teamName = nr[i].franchiseName ;

    	    console.log(hr + " -  " + fullName+ ", " + yearID + ", " + teamName ) ;
        }
        
        callback(null, "Success") ;
    })
	
};
