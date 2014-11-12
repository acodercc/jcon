/**
 *
 * Parser函数，继承自jFunction
 *
 */

function Parser(f){
    return jFunction.create({
        parse: function(){
            return this._.apply(this, arguments);
        }
    }).initializer(f);
}
