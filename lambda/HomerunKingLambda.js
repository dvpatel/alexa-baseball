var Alexa = require("alexa-sdk");

var async = require('async');

var nconf = require('nconf') ;
nconf.file({file: 'config.json'}) ;

var awsConfig = nconf.get('aws-config') ;
var apputilmod = require('apputil') ;
var apputil = apputilmod(awsConfig) ;


var APP_STATES = {
	    PLAY: "_PLAY",   // Asking stat questions
	    START: "_START", // Entry point, start the game.
	    HELP: "_HELP"    // The user is asking for help.
	};

/*
 *  Lambda handler for homerunking
 */
exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.bed251cd-36fa-4e36-bc51-5eb70eba67ee';  
    alexa.registerHandlers(baseballHandlers);
    alexa.execute();
}


var baseballHandlers = { 
	    /*  Must support:  LaunchRequest, IntentRequest, and SessionEndedRequest" */		
		
		'LaunchRequest': function () {
			
            var result = "Welcome to sports nation. You can ask a question like, what\'s babe ruth career home runs?...  What stat can I get you?" ;

            this.attributes['result'] = result ;
            this.attributes['resultReplay'] = result ;

            this.emit(':ask', result) ;            
	    },
	    
	    /*  
	     *  Specific stat for given player:  BA, RBI, SLG, SB, OBP, OPS, R, HR 
	     */
	    'PlayerSpecificCareerStatsIntent' : function() {
	    	
	    	var slots = this.event.request.intent.slots ;

	        var basicStatName = apputil.getName(slots, "basicStatName") ;	    	
	    	var inpFirstname = apputil.getName(slots, "firstName") ;
	        var inpLastname = apputil.getName(slots, "lastName") ;
	        	        
            var self = this ;            
	    	apputil.battingStatsByPlayer(inpFirstname, inpLastname, basicStatName, function(err, data) {
	    	    if (err) {
	    	        console.error("PlayerSpecificCareerStatsIntent Error:  " + err) ;
    	    		self.emit(':ask', err);
	    	    } else {	    	

	    	    	//  BA, RBI, SB, R, HR, etc. ==>  add them together
	    	    	//  SLG, OBP, OPS ==>  take average ;	    	    	
	    	    	var y = ["BA", "SLG", "OBP", "OPS"];	    	    	
	    	    	
    	    		var t = 0 ;
	    	    	if (y.indexOf(data.statKey) != -1) {	    	    		
	    	    		for (var i = 0; i < data.length; i++ ) {
	    	    			var d = data[i] ;
	    	    			t = t + parseFloat(d[data.statKey]) ;	    	    			
	    	    		}	    	    			    	    		
	    	    		t = ((t / data.length)/1000).toFixed(3) ;	    	    		
	    	    	} else {	    	    		
	    	    		for (var i = 0; i < data.length; i++ ) {
	    	    			var d = data[i] ;
	    	    			t = t + d[data.statKey] ;	    	    			
	    	    		}	    	    		
	    	    	}

    	    		var result = inpFirstname + " " + inpLastname + " career " + data.statName + " is " + t + "." ;
    	    		
    	            self.attributes['result'] = result ;
    	            self.attributes['resultReplay'] = result ;

    	    		self.emit(':tell', result, result);
	    	    }
	    	    
	    	})	        
	    },	    
	    
	    /*
	     *  Player career stats for BA, RBI, home runs and OPS
	     */
	    'PlayerCareerStatsIntent' : function() {
	        
	    	var slots = this.event.request.intent.slots ;
	    	
	    	var inpFirstname = apputil.getName(slots, "firstName") ;
	        var inpLastname = apputil.getName(slots, "lastName") ;
	        
            var self = this ;            
            
            //  null indicates get all status, this is placeholder for basicStatName
	    	apputil.battingStatsByPlayer(inpFirstname, inpLastname, null, function(err, data) {
	    	    if (err) {
	    	        console.error("PlayerCareerStatsIntent Error:  " + err) ;
    	    		self.emit(':ask', err);
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
	    	    	
	    	    	var result = "Here are the career stats for " + inpFirstname + " " + inpLastname + ": " + "total home runs " + thr + ", total batting average " + tba + ", total R.B.I. was " + trbi + " and total O.P.S. was " + tops ;
	    	    	
	                self.attributes['result'] = result ;
	                self.attributes['resultReplay'] = result ;


	    	    	self.emit(':tell', result, result);

	    	    }
	    	    
	    	})	        
	    	
	    },

	    /*
	     * Get stats leader for given year:  BA, RBI, SLG, SB, OBP, OPS, R, HR
	     */
	    'StatsKingForYearIntent': function () {	    		    	
	    	
	    	var slots = this.event.request.intent.slots ;

	        var basicStatName = apputil.getName(slots, "basicStatName") ;	    	
	        var endYear = apputil.getNumber(slots, "givenYear") ;
	        var startYear = endYear-1 ;
	        
            var self = this ;            
	    	apputil.maxStatByYears(startYear, endYear, basicStatName, function(err, data) {			    		
	    		if (err) {	    			
	    		    console.error("Error:  " + err) ;	    		    
	    		    self.emit(':ask', err) ;	    		    
	    		} else {	    			
                    var xval = apputil.battingUtil(data, data.statKey) ;
	    	    	var fullName = data[0].fullName ;
	    	    	var yearID = data[0].yearID ;
	    	    	var teamName = data[0].name ;

	                var result = fullName + " had the most " + data.statName + " at " + xval + " in " + yearID ;
	                
	                self.attributes['result'] = result ;
	                self.attributes['resultReplay'] = result ;

		    	    self.emit(':tell', result, result);
		    	    
	    		}				    		
	    	}) ;	        
	    },
	    
	    /*
	     * Get stats leader for a given year range.
	     */
	    'StatsKingForYearRangeIntent': function () {	    	

	    	var slots = this.event.request.intent.slots ;
	    	
	        var startYear = apputil.getNumber(slots, "startYear") ;
	        var endYear = apputil.getNumber(slots, "endYear") ;
	        var basicStatName = apputil.getName(slots, "basicStatName") ;
	        	        
            var self = this ;            
	    	apputil.maxStatByYears(startYear, endYear, basicStatName, function(err, data) {		
	    		
	    		if (err) {
	    		    console.error("Error:  " + err) ;
	    		    self.emit(':ask', err) ;	    		    
	    		} else {

                    var xval = apputil.battingUtil(data, data.statKey) ;
	    	    	var fullName = data[0].fullName ;
	    	    	var yearID = data[0].yearID ;
	    	    	var teamName = data[0].name ;

                    var result = "The "+ data.statName +" leader between " + startYear + " and " + endYear + " was " + fullName + ".  He had " + xval + " " + data.statName + " in " + yearID ;
                    
                    self.attributes['result'] = result ;
                    self.attributes['resultReplay'] = result ;


                    self.emit(':tell', result, result);		    	    
	    		}			
	    		
	    	}) ;	    			        
	    },
	    
	    /*
	     *  Get stat by year for a player
	     */
	    'PlayerBasicStatByYearIntent' : function() {
	    	
	    	var slots = this.event.request.intent.slots ;
	    	
	    	var inpFirstname = apputil.getName(slots, "firstName") ;
	        var inpLastname = apputil.getName(slots, "lastName") ;
	        var basicStatName = apputil.getName(slots, "basicStatName") ;	    	
	        var inpYear = apputil.getNumber(slots, "playerYear") ;
	        
            var self = this ;            
	    	apputil.battingStatsByYearByPlayer(inpFirstname, inpLastname, inpYear, basicStatName, function(err, data) {
	    	    if (err) {
	    	    	
	    		    console.error("Error:  " + err) ;	    		    
	    		    self.emit(':ask', err) ;	    		    
	    	    	
	    	    } else {	    		    	    	
	    	    	for (var i = 0; i < data.length; i++) {
	    	    		
	    	    		var r = data[i] ;	    	    	
	    	    		var team = r.name ;	    	    		
	    	    		var results = [
                            "While playing for the " + team + " in " + inpYear + ", "  + inpFirstname + " " + inpLastname + " had " + r[data.statKey] + " " + data.statName,
                            inpFirstname + " " + inpLastname + " had " + r[data.statKey] + " " + data.statName + " in " + inpYear + ".  He was playing for the " + team,
                            "In " + inpYear + ", " + inpFirstname + " " + inpLastname + " had " + r[data.statKey] + " " + data.statName + " while playing for the " + team] ;

	    	    		var rindx = Math.floor(Math.random() * 3) + 0 ;	    	    		
	    	    		
	    	    		var result = results[rindx] ;
	    	    		
	    	            self.attributes['result'] = result ;
	    	            self.attributes['resultReplay'] = result ;

	    	    		self.emit(':tell', result, result);	    	    		
	    	    	}	    	    		    	    	
	    	    }
	    	}) ;	        
	    },
	    	    
	    'AMAZON.HelpIntent': function() {
	        this.emit(':ask', ' Ask sports nation to get you stats for your favorite sport player.  ' +  
	        		'Try asking sports nation for Babe Ruth career stats.');
	    },
	    
	    /*  Disable repeat for now.
	    'AMAZON.RepeatIntent': function () {
	    	
	    	var result = "Repeating.  " + this.attributes['result'] ;
	    	var resultReplay = "Repeating again."  + this.attributes['resultReplay'] ;
	    	
	        this.emit(':ask', result, resultReplay) ;
	        
	    },*/
	    
	    'SessionEndedRequest': function() {
    		this.emit(':tell', "Ok.  See ya!");    		
	    },
	    
	    'AMAZON.StopIntent': function() {
	    	this.emit(':tell', 'Ok.  Please come back again to FAN sports nation.') ;
	    },
	    
	    'AMAZON.CancelIntent': function() {
	    	this.emit(':tell', 'Ok.  Thank you!  Come again!') ;
	    },
	    
	    'Unhandled': function() {
	        //  this.emit(':ask', 'Sorry, I did not understand. Try asking something like, Who was the home run king for 1989?');
	    	
	    	var result = "Sorry, I did not understand. You can ask something like, Who was the home run king for 1989?"; 
	        this.attributes['result'] = result ;
	        this.attributes['resultReplay'] = result ;
	        this.emit(':ask', result, result) ;
	    	
	    }
};
