/**
 *
 * css-selector
 *
 */

(function(){

    var jcon = require('../src/jcon');

    var className = jcon.regex(/\.\w+/);
    var idName = jcon.regex(/\#\w+/);
    var tagName = jcon.regex(/\w+/);
    var childSymbol = jcon.regex(/\s*(>)\s*/, 1);
    var posteritySymbol = jcon.regex(/(\s)+/, 1);
    var property = jcon.regex(/\[([^=]+)\=([^]]*)\]/);

    var selector = jcon.or(idName, className, tagName, childSymbol, posteritySymbol, property).many();


    var selectors = selector.parse('aa.aa >  aa .bb[a=b]  #a');

    console.log(selectors);

}());
