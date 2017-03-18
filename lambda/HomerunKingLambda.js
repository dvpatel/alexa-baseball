var Alexa = require("alexa-sdk");

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
    var alexa = Alexa.handler(event, context);
    alexa.appId = '';  // TBD
    alexa.registerHandlers(handlers);
    alexa.execute();
}

var handlers =  { 
	    'LaunchRequest': function () {
	        this.emit('SayHello');
	    },
	    
	    /*
	     * Get top homeruns hitter for a given year.
	     */
	    'HomerunKingForYearIntent': function () {	    	
	    	
	        var endYear = this.event.request.intent.slots.givenYear.value - 0 ;
	        var startYear = endYear - 1 ;

            var self = this ;            
	    	apputil.maxHomerunByYears(startYear, endYear, function(err, data) {		
	    		
	    		if (err) {
	    		    console.log(JSON.stringify(err)) ;
	    		    callback(new Error(err));
	    		} else {

	    			var result ;
	    	        for (var i = 0; i < data.length; i++) {

	    	    	    var hr = data[i].HR ;
	    	    	    var fullName = data[i].fullName ;
	    	    	    var yearID = data[i].yearID ;
	    	    	    var teamName = data[i].franchiseName ;

	                    result = fullName + " had the most home runs at " + hr + " in " + yearID ;
	    	        }
	    	        self.emit(':tell', result);
	    		}			
	    		
	    	}) ;
	        
	    },	    
	    /*
	     * Get top homeruns hitter for a given year.
	     */
	    'MostHomerunsByYearsIntent': function () {	    	
	    	
	        var startYear = this.event.request.intent.slots.startYear.value - 0 ;
	        var endYear = this.event.request.intent.slots.endYear.value - 0 ;

            var self = this ;            
	    	apputil.maxHomerunByYears(startYear, endYear, function(err, data) {		
	    		
	    		if (err) {
	    		    console.log(JSON.stringify(err)) ;
	    		    callback(new Error(err));
	    		} else {

	    			var i = 0 ;
    	    	    var hr = data[i].HR ;
    	    	    var fullName = data[i].fullName ;
    	    	    var yearID = data[i].yearID ;
    	    	    var teamName = data[i].franchiseName ;

                    var result = "The home run king between " + startYear + " and " + endYear + " was " + fullName + ".  He hit " + hr + " home runs in " + yearID ;
                    
	    	        self.emit(':tell', result);
	    		}			
	    		
	    	}) ;
	        
	    },

	    
	    
	    
	    'Unhandled': function() {
	        console.log("UNHANDLED");
	        this.emit(':ask', 'Sorry, I didn\'t get that. Try asking something like, Who was the home run king for 1989');
	    }
};
