'use strict';
var Alexa = require("alexa-sdk");
var appId = 'amzn1.ask.skill.9fbc5ce3-554d-40b7-9440-fca0052532d1';//app specific

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
    'GetMostHomeruns': function () {
        
        var userDate = this.event.request.intent.slots.Date.value
        this.emit(':tell', userDate.toString() + ' I am a work in progress, I can let you know once I get my DynamoDB!');
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        this.emit(':ask', 'Sorry, I didn\'t get that. Try asking something like, Who hit the most homeruns last year');
    }
};
