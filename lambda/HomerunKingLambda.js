var Alexa = require("alexa-sdk");

var async = require('async');

var nconf = require('nconf') ;
nconf.file({file: 'config.json'}) ;

var awsConfig = nconf.get('aws-config') ;
var apputilmod = require('apputil') ;
var apputil = apputilmod(awsConfig) ;


/*
 *  Lambda handler for homerunking
 */
exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.bed251cd-36fa-4e36-bc51-5eb70eba67ee';
    alexa.registerHandlers(handlers);
    alexa.execute();
}

var handlers =  { 
	    'LaunchRequest': function () {
	        this.emit('SayHello');
	    },

	    /*  
	     *  Specific stat for given player:  BA, RBI, SLG, SB, OBP, OPS, R, HR 
	     */
	    'PlayerSpecificCareerStatsIntent' : function() {
	    	
	        var inpFirstname = this.event.request.intent.slots.firstName.value.toLowerCase() ;
	        var inpLastname = this.event.request.intent.slots.lastName.value.toLowerCase() ;
	        var basicStatName = this.event.request.intent.slots.basicStatName.value.toLowerCase() ;

	        console.log("PlayerSpecificCareerStatsIntent:  " + inpFirstname + " " + inpLastname + ", " + basicStatName) ;
	        
	        var stat = kv[basicStatName] ;
	        
	        if (!stat) {
	        	var result = "Sorry.  Please try again." ;
	    		this.emit(':tell', result);
	    		return ;
	        }
	        
	        var statDef = sdef[stat] ;
	        
            var self = this ;            
	    	apputil.battingStatsByPlayer(inpFirstname, inpLastname, function(err, data) {
	    	    if (err) {
	    	        console.error(err) ;
	    	    } else {	    	

	    	    	//  BA, RBI, SB, R, HR, etc. ==>  add them together
	    	    	//  SLG, OBP, OPS ==>  take average ;
	    	    	
	    	    	var y = ["BA", "SLG", "OBP", "OPS"];	    	    	
	    	    	
	    	    	//  console.log("StatName:  " + basicStatName + ", Map:  " + stat + ", statDef:  " + statDef) ;	    	    	
    	    		var t = 0 ;
	    	    	if (y.indexOf(stat) != -1) {	    	    		
	    	    		for (var i = 0; i < data.length; i++ ) {
	    	    			var d = data[i] ;
	    	    			t = t + parseFloat(d[stat]) ;	    	    			
	    	    		}
	    	    			    	    		
	    	    		t = ((t / data.length)/1000).toFixed(3) ;
	    	    		
	    	    	} else {
	    	    		
	    	    		for (var i = 0; i < data.length; i++ ) {
	    	    			var d = data[i] ;
	    	    			t = t + d[stat] ;	    	    			
	    	    		}
	    	    		
	    	    	}

    	    		var result = inpFirstname + " " + inpLastname + " career " + statDef + " is " + t ;
    	    		self.emit(':tell', result);
	    	    }
	    	    
	    	})	        
	    },	    
	    
	    /*
	     *  Player career stats for BA, RBI, home runs and OPS
	     */
	    'PlayerCareerStatsIntent' : function() {
	        var inpFirstname = this.event.request.intent.slots.firstName.value ;
	        var inpLastname = this.event.request.intent.slots.lastName.value ;
	        
	        console.log("PlayerCareerStatsIntent:  " + inpFirstname + " " + inpLastname) ;

            var self = this ;            
	    	apputil.battingStatsByPlayer(inpFirstname.toLowerCase(), inpLastname.toLowerCase(), function(err, data) {
	    	    if (err) {
	    	        console.error(err) ;
	    	    } else {	    	

	    	    	var thr = 0 ;  // total home runs ;
	    	    	var trbi = 0 ; //  total rbi
	    	    	var tba = 0 ;
	    	    	var tops = 0 ;
	    	    	
	    	    	for (var i = 0; i < data.length; i++) {
	    	    		
	    	    		var d = data[i] ;
	    	    		
	    	    		thr = thr + d.HR ;	    	    		
	    	    		trbi = trbi + d.RBI ;	    	    		
	    	    		tba = tba + d.BA ;
	    	    		tops = tops + d.OPS ;
	    	    		
	    	    	}

    	    		tba = ((tba / data.length)/1000).toFixed(3) ;
    	    		tops = ((tops / data.length)/1000).toFixed(3) ;
	    	    	
	    	    	var result = "Here are the career stats for " + inpFirstname + " " + inpLastname + " : " + "total home runs " + thr + ", total batting average " + tba + ", total R.B.I. was " + trbi + " and total O.P.S. was " + tops ;	    	    	
    	    		self.emit(':tell', result);

	    	    }
	    	    
	    	})	        
	    	
	    },

	    /*
	     * Get stats leader for given year:  BA, RBI, SLG, SB, OBP, OPS, R, HR
	     */
	    'StatsKingForYearIntent': function () {	    		    	
	    	
	    	var slots = this.event.request.intent.slots ;
	    	
	        var basicStatName = ((slots.basicStatName) ? slots.basicStatName.value : "NO_STAT").toLowerCase() ;	    	
	        var endYear = (slots.givenYear) ? slots.givenYear.value-0 : "NO_DATE"
	        var startYear = endYear-1 ;
	        
            var self = this ;            
	    	apputil.maxStatByYears(startYear, endYear, basicStatName, function(err, data) {			    		
	    		if (err) {	    			
	    		    console.error("Error:  " + err) ;	    		    
	    		    self.emit(':tell', err) ;	    		    
	    		} else {	    			
                    var xval = apputil.battingUtil(data, data.statKey) ;
	    	    	var fullName = data[0].fullName ;
	    	    	var yearID = data[0].yearID ;
	    	    	var teamName = data[0].name ;

	                var result = fullName + " had the most " + data.statName + " at " + xval + " in " + yearID ;
		    	    self.emit(':tell', result);		    	    
	    		}				    		
	    	}) ;	        
	    },
	    
	    /*
	     * Get stats leader for a given year range.
	     */
	    'StatsKingForYearRangeIntent': function () {	    	

	    	var startYear = this.event.request.intent.slots.startYear.value - 0 ;
	        var endYear = this.event.request.intent.slots.endYear.value - 0 ;
	    	
	        var basicStatName = this.event.request.intent.slots.basicStatName.value.toLowerCase() ;	        
	        var stat = kv[basicStatName] ;
	        
	        if (!stat) {
	        	var result = "Sorry.  Please try again." ;
	    		this.emit(':tell', result);
	    		return ;
	        }	       
	        
	        var statDef = sdef[stat] ;
	        	    	
	        /*
	         * Saving on DynamoDB cost and time
	         */
	        if ((endYear-startYear) > 10) {
	        	var result = "Sorry.  Please pick a time range that is less than 10 years." ;
	    	    self.emit(':tell', result);	        	
	        }
	        
            var self = this ;            
	    	apputil.maxStatByYears(startYear, endYear, stat, function(err, data) {		
	    		
	    		if (err) {
	    		    console.log(JSON.stringify(err)) ;
	    		    callback(new Error(err));
	    		} else {
	    			
	    			var xval = data[0][stat] ;
	    	    	var y = ["BA", "SLG", "OBP", "OPS"];	    	    	
	    	    	if (y.indexOf(stat) != -1) {
	    	    		xval = ((xval / data.length)/1000).toFixed(3) ;
	    	    	}
	    			
	    	    	var fullName = data[0].fullName ;
	    	    	var yearID = data[0].yearID ;
	    	    	var teamName = data[0].name ;

                    var result = "The "+ statDef +" leader between " + startYear + " and " + endYear + " was " + fullName + ".  He hit " + xval + " " + statDef + " in " + yearID ;
		    	    self.emit(':tell', result);		    	    
	    		}			
	    		
	    	}) ;	    			        
	    },
	    
	    /*
	     *  Get stat by year for a player
	     */
	    'PlayerBasicStatByYearIntent' : function() {
	    	
	    	var slots = this.event.request.intent.slots ;
	    	
	        var inpFirstname = ((slots.firstName) ? slots.firstName.value : "NO_FIRST_NAME").toLowerCase() ;
	        var inpLastname = ((slots.lastName) ? slots.lastName.value : "NO_LAST_NAME").toLowerCase() ;
	        var basicStatName = ((slots.basicStatName) ? slots.basicStatName.value : "NO_STAT").toLowerCase() ;	    	
	        var inpYear = (slots.playerYear) ? slots.playerYear.value-0 : "NO_DATE"
	        
            var self = this ;            
	    	apputil.battingStatsByYearByPlayer(inpFirstname, inpLastname, inpYear, basicStatName, function(err, data) {
	    	    if (err) {
	    	    	
	    		    console.error("Error:  " + err) ;	    		    
	    		    self.emit(':tell', err) ;	    		    
	    	    	
	    	    } else {	    		    	    	
	    	    	for (var i = 0; i < data.length; i++) {
	    	    		
	    	    		var r = data[i] ;	    	    	
	    	    		var team = r.name ;	    	    		
	    	    		var results = [
                            "While playing for the " + team + " in " + inpYear + ", "  + inpFirstname + " " + inpLastname + " had " + r[data.statKey] + " " + data.statName,
                            inpFirstname + " " + inpLastname + " had " + r[data.statKey] + " " + data.statName + " in " + inpYear + ".  He was playing for the " + team,
                            "In " + inpYear + ", " + inpFirstname + " " + inpLastname + " had " + r[data.statKey] + " " + data.statName + " while playing for the " + team] ;

	    	    		var rindx = Math.floor(Math.random() * 3) + 0 ;	    	    		
	    	    		
	    	    		self.emit(':tell', results[rindx]);	    	    		
	    	    	}	    	    		    	    	
	    	    }
	    	}) ;	        
	    },
	    
	    'AMAZON.HelpIntent': function() {
	        this.emit(':tell', ' Ask sports nation to get you stats for your favorite sport player.  ' +  
	        		'Try asking sports nation for Babe Ruth career stats.');
	    },
	    
	    'Unhandled': function() {
	        this.emit(':ask', 'Sorry, I did not understand. Try asking something like, Who was the home run king for 1989');
	    }
};
