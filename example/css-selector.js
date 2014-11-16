/**
 *
 * 基于jcon的css-selector的parser
 *
 *
 *  css3-selector的parser项目(基于jcon):
 *      https://github.com/takumi4ichi/shorthair
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
