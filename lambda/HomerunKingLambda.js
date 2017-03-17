var async = require('async');
var AWS = require('aws-sdk');

function test1(evt) {
   return function(cb) {
       console.log('value1 =', evt.key1);
       cb(null, evt) ;
   }  ;
}

function test2(evt, cb) {
    console.log('value2 =', evt.key2);
    cb(null, evt) ;
}

function test3(evt, cb) {
    console.log('value3 =', evt.key3);
    cb(null, evt) ;
}

exports.handler = function(event, context, callback) {

    var evt = event ;
    async.waterfall([
        test1(evt),
        test2,
        test3
    ], function(err) {
        callback(null, "Success") ;
    }) ;

};
