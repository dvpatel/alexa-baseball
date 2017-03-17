/*
 *   node HomerunsSearch 1975 25
 *   Get list of players with given HR for a given YEAR in HR order
 */

//  DB utility for homerns lookup
var async = require('async');

var nconf = require('nconf') ;
nconf.file({file: 'config.json'}) ;
var dbutil = require('./my_modules/dbutil')(nconf.get('aws-config')) ;

/*
 * Input with default of 2016 20 home runs
 */
var inpYear = (process.argv[2] || 2016)-0 ;
var inpHR = (process.argv[3] || 20)-0 ;

/*
 * First chained function to get home runs based on inputed values and results constraint
 */
function homeruns(callback) {
    
    dbutil.homeruns(inpYear, inpHR, 15, function(err, data) {
        if (err) {
            console.error(err) ;
        } else {
            //if (data.Items.length > 0) {
                callback(null, data.Items) ;
            //}
        }
    }) ;

}

/*
 * Second chained function to locate player name based on playerID
 */
function playerLookup(hr_items, callback) {
    var r = {} ;
    async.each(hr_items,
        function(item, cb) {

            dbutil.playerLookup(item.playerID, function(err, data) {
                if (err) {
                    console.error(err) ;
                } else {
		    item["fullName"] = data.Item.fullName ;
                }
                cb() ;
            }) ;

        }, function(err) {
        	callback(null, hr_items) ;
        }
    ) ;
}

/*
 * Third chained function to lookup team name based on playerID and yearID 
 */
function teamNameLookup(hr_items, callback) {
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
 * Calling function to get players with inputed home runs or more for inputed year
 */
(function() {
    async.waterfall([ 
        homeruns,
        playerLookup,
        teamNameLookup
    ], function(error, hr_items) {
        for (var i = 0; i < hr_items.length; i++) {
	    var data = hr_items[i] ;
    	    console.log(data.HR + " -  " + data.fullName+ ", " + data.yearID + ", " + data.franchiseName) ;
        }
    }) ;
})()
