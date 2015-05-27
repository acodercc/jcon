(function(){
    var jcon = require('../src/jcon');
    var digit = jcon.regex(/[0-9]/);
    var epsilon = jcon.string('');

    var sum_operator = jcon.regex(/[\+\-]/).setAst('sum_op');
    var product_operator = jcon.or(jcon.string('*'), jcon.string('/')).setAst('product_op');

    var number = digit.least(1).setAst('number');

    var sum = jcon.lazy(function(){
        return jcon.or(product,
            jcon.seq(product, sum_rest).setAst('sum')
        );
    });
    var sum_rest = jcon.or(epsilon,  jcon.seq(sum_operator, sum));

    var product = jcon.lazy(function(){
        return jcon.or(number,
            jcon.seq(number, product_rest).setAst('product')
        );
    });
    var product_rest = jcon.or(epsilon, jcon.seq(product_operator, product));
    
    var expr = sum;

    console.log( JSON.stringify(expr.parse('1+2*3').ast(), null, '  ') );


})();
