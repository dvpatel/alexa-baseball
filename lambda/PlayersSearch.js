/*
 *  node PlayersSearch Ortiz
 *  Find player given last name
 */

var nconf = require('nconf') ;
nconf.file({file: 'config.json'}) ;
var dbutil = require('./my_modules/dbutil')(nconf.get('aws-config')) ;

/*
 * Input last name
 */
var inpLastname = (process.argv[2] || "Ortiz") ;

dbutil.playerLookupByName(inpLastname, function(err, data) {

    if (err) {
        console.error(err) ;
    } else {
        data.Items.forEach(function(player) {
            console.log(player.firstName + " " + player.lastName + " - " + player.birthYear) ;
        });
    }

}) ;
