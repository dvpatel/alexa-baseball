/*
 *  node PlayersSearch Ortiz
 *  Find player given last name
 */

var Util = require("./Util");

/*
 * Input last name
 */
var inpLastname = (process.argv[2] || "Ortiz") ;

Util.playerLookupByName(inpLastname, function(err, data) {

    if (err) {
        console.error(err) ;
    } else {
        data.Items.forEach(function(player) {
            console.log(player.firstName + " " + player.lastName + " - " + player.birthYear) ;
        });
    }

}) ;
