(function(){

    var jcon = require('../src/jcon');

    var className = jcon.regex(/\.\w+/);
    var idName = jcon.regex(/\#\w+/);
    var tagName = jcon.regex(/\w+/);
    var childSymbol = jcon.regex(/\s*>\s*/);
    var posteritySymbol = jcon.regex(/\s+/);
    var property = jcon.regex(/\[([^=]+)\=([^]]*)\]/);

    var baseSelector = jcon.or(idName, className, tagName, childSymbol, posteritySymbol, property);

    var selectors = baseSelector.many().parse('aa.aa>aa .bb[a=b] #a');

    console.log(selectors);

}());
