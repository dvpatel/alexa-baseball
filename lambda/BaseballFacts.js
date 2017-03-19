'use strict';
var Alexa = require("alexa-sdk");
var appId = '';//app specific

/* external dependencies*/
var async = require('async');

var nconf = require('nconf') ;
nconf.file({file: 'config.json'}) ;

var awsConfig = nconf.get('aws-config') ;
var apputilmod = require('./my_modules/apputil') ;
var apputil = apputilmod(awsConfig) ;
/* end external dependencies */

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers =  { 
    'LaunchRequest': function () {
        console.log("hello");
        this.emit('SayHello');
    },
    'GetMostHomerunsByYears': function () {
        var date = {};
        var startDate = this.event.request.intent.slots.StartDate.value;
        var endDate = this.event.request.intent.slots.EndDate.value;
        
        date.startYear = startDate;
        date.endYear= endDate;
        
        var homerunObject = {};
        
        homerunObject = getMaxHomeRunsByYears(date);
        
        this.emit(':tell', homerunObject.fullName + ' hit ' + homerunObject.HR + ' homeruns in ' + homerunObject.yearId);
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        this.emit(':ask', 'Sorry, I didn\'t get that. Try asking something like, Who hit the most homeruns last year');
    }
};


function getMaxHomeRunsByYears(dates){
    console.log(dates);

    var object = {};
    object.HR = '73';
    object.fullName = 'Barry Bonds';
    object.yearId = '2001';
    object.fanchiseName = 'San Francisco Giants';
    return object;
}