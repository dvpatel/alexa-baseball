var Alexa = require("alexa-sdk");

var async = require('async');

var nconf = require('nconf') ;
nconf.file({file: 'config.json'}) ;

var awsConfig = nconf.get('aws-config') ;
var apputilmod = require('apputil') ;
var apputil = apputilmod(awsConfig) ;


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
		"dingers":"HR",
		"homers":"HR"
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
"HR":"Home Runs"
}


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

	    'PlayerCareerStatsIntent' : function() {
	        var inpFirstname = this.event.request.intent.slots.firstName.value.toLowerCase() ;
	        var inpLastname = this.event.request.intent.slots.lastName.value.toLowerCase() ;

            var self = this ;            
	    	apputil.battingStatsByPlayer(inpFirstname, inpLastname, function(err, data) {
	    	    if (err) {
	    	        console.error(err) ;
	    	    } else {	    	

	    	    	var thr = 0 ;  // total home runs ;
	    	    	var trbi = 0 ; //  total rbi
	    	    	var tsb = 0 ;  //  total stolen bases
	    	    	var tr = 0 ;  //  total runs
	    	    	for (var i = 0; i < data.length; i++) {
	    	    		var d = data[i] ;	    	    		
	    	    		thr = thr + d.HR ;
	    	    		trbi = trbi + d.RBI ;
	    	    		tsb = tsb + d.SB ;
	    	    		tr = tr + d.R ;
	    	    	}
	    	    
	    	    	var result = "Here are the career stats for " + inpFirstname + " " + inpLastname + " : " + "total home runs " + thr + ", total runs batted in " + trbi + ", total runs scored " + tr + " and total stolen bases " + tsb ;	    	    	
    	    		self.emit(':tell', result);

	    	    }
	    	    
	    	})	        
	    	
	    },
	    
	    'PlayerSpecificCareerStatsIntent' : function() {
	    	
	    	//PlayerSpecificCareerStatsIntent get me {firstName} {lastName} career {basicStatName} stat

	        var inpFirstname = this.event.request.intent.slots.firstName.value.toLowerCase() ;
	        var inpLastname = this.event.request.intent.slots.lastName.value.toLowerCase() ;
	        var basicStatName = this.event.request.intent.slots.basicStatName.value.toLowerCase() ;

	        var stat = kv[basicStatName] ;
	        var statDef = sdef[stat] ;
	        
            var self = this ;            
	    	apputil.battingStatsByPlayer(inpFirstname, inpLastname, function(err, data) {
	    	    if (err) {
	    	        console.error(err) ;
	    	    } else {	    	

	    	    	//  BA, RBI, SB, R, HR ==>  add them together
	    	    	//  SLG, OBP, OPS ==>  take average ;
	    	    	
	    	    	var x = ["RBI", "SB", "R", "HR"] ;
	    	    	var y = ["BA", "SLG", "OBP", "OPS"];	    	    	
	    	    	
	    	    	//  console.log("StatName:  " + basicStatName + ", Map:  " + stat + ", statDef:  " + statDef) ;	    	    	
    	    		var t = 0 ;
	    	    	if (x.indexOf(stat) != -1) {
	    	    		
	    	    		for (var i = 0; i < data.length; i++ ) {
	    	    			var d = data[i] ;
	    	    			t = t + d[stat] ;	    	    			
	    	    		}
	    	    			    	    		
	    	    	} else if (y.indexOf(stat) != -1) {
	    	    		
	    	    		var t = 0 ;
	    	    		for (var i = 0; i < data.length; i++ ) {
	    	    			var d = data[i] ;
	    	    			t = t + parseFloat(d[stat]) ;	    	    			
	    	    		}
	    	    		
	    	    		t = (t / data.length).toFixed(3) ;
	    	    	}

	    	    	console.log(result) ;
    	    		var result = inpFirstname + " " + inpLastname + " career " + statDef + " is " + t ;
    	    		self.emit(':tell', result);
	    	    }
	    	    
	    	})	        
	        

	    },
	    
	    'PlayerBasicStatByYearIntent' : function() {
	    	
	        var inpYear = this.event.request.intent.slots.playerYear.value - 0 ;
	        var inpFirstname = this.event.request.intent.slots.firstName.value.toLowerCase() ;
	        var inpLastname = this.event.request.intent.slots.lastName.value.toLowerCase() ;
	        var basicStatName = this.event.request.intent.slots.basicStatName.value.toLowerCase() ;
	        	        
	        var stat = kv[basicStatName] ;
	        var statDef = sdef[stat] ;
	        
	        //console.log("Requested stat:  " + stat + ", Def:  " + statDef) ;
	        //console.log("Year:  " + inpYear + ", FN:  " + inpFirstname + ", LN:  " + inpLastname) ;

            var self = this ;            
	    	apputil.battingStatsByYearByPlayer(inpFirstname, inpLastname, inpYear, function(err, data) {
	    	    if (err) {
	    		    console.log(JSON.stringify(err)) ;
	    		    callback(new Error(err));	    	    	
	    	    } else {	    		    	    	
	    	    	for (var i = 0; i < data.length; i++) {
	    	    		
	    	    		var r = data[i] ;	    	    	
	    	    		var team = r.name ;	    	    		
	    	    		var results = [
	    	    			"While playing for the " + team + " in " + inpYear + ", "  + inpFirstname + " " + inpLastname + " had " + r[stat] + " " + statDef,
	    	    			inpFirstname + " " + inpLastname + " had " + r[stat] + " " + statDef + " in " + inpYear + ".  He was playing for the " + team,
	    	    			"In " + inpYear + ", " + inpFirstname + " " + inpLastname + " had " + r[stat] + " " + statDef + " while playing for the " + team] ;

	    	    		var rindx = Math.floor(Math.random() * 3) + 0 ;	    	    		

	    	    		console.log(results[rindx]) ;
	    	    		self.emit(':tell', results[rindx]);
	    	    		
	    	    	}	    	    		    	    	
	    	    }
	    	}) ;	        
	    },
	    	    
	    /*
	     * Get top homeruns hitter for a given year.
	     */
	    'HomerunsByPlayerYearIntent': function () {	    	
	    	
	        var inpYear = this.event.request.intent.slots.playerYear.value - 0 ;
	        var inpFirstname = this.event.request.intent.slots.firstName.value.toLowerCase() ;
	        var inpLastname = this.event.request.intent.slots.lastName.value.toLowerCase() ;
	        
            var self = this ;            
	    	apputil.battingStatsByYearByPlayer(inpFirstname, inpLastname, inpYear, function(err, data) {
	    	    if (err) {
	    		    console.log(JSON.stringify(err)) ;
	    		    callback(new Error(err));	    	    	
	    	    } else {
	    	    	
	    	    	for (var i = 0; i < data.length; i++) {
	    	    	
	    	    		var r = data[i] ;
	    	    		var thr = r.HR ;	    	    		
	    	    		var team = r.name ;	    	    			

		    	    	var result = inpFirstname + " " + inpLastname + " hit " + thr + " home runs in " + inpYear + " while playing for " + team ;
		    	        self.emit(':tell', result);
		    	        
	    	    	}
	    	    }
	    	}) ;	        
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
	    	    	    var teamName = data[i].name ;

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
    	    	    var teamName = data[i].name ;

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
