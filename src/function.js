/**
 *
 * 对javascript中function类型进行增强
 *
 *  在javascript中，function是第一类型，如想要对function的结果进行链式的DSL改造
 *  可能的方案是对function进行封装为新的function
 *
 *  另一种方案，我们创建一个jFunction类型的对象
 *  该jFunciton拥有一个__fun__成员，指向被封装的function，并增加一个约束，外部代码不允许直接访问jfun.__fun__
 *  使该function没有机会直接被外部调用
 *
 *  如果想要调用该jfun.__fun__指向的function，仅有的办法是从jfun进行派生，在子对象中，对this.__fun__进行访问
 *  从而实现对jfun.__fun__的各种封装
 *
 *
 *  如：
 *
 *
     mul2 = jFunction.create({
        run: function(){
            return this.__fun__.apply(this, arguments);
        },
        map: function(){
            var rets = [];
            for(var i=0,len=arguments.length; i<len; i++){
                rets.push( this.run(arguments[i]) );
            }
            return rets;
        }
     }).initialize(function(num){
         return num*2;
     });

    console.log( mul2.run(2) );

    console.log( mul2.map(2,4) );
 *
 *
 */

var jFunction = (function(){

    var jObject = require('./object');

    /**
     *
     * jFunction 是自定义的函数对象，该对象封装了一个js的原生function
     *
     */
    return jObject.create({

        /**
         *
         * @method initialize
         *
         * @param {function} f  被封装的函数
         *
         */
        initialize: function(f){
            this.__fun__ = f;
            return this;
        }

    });

}());

(function(identifier, mod){
    var isAmd = typeof define === 'function',
    isCommonJs = typeof module === 'object' && !!module.exports;

    if (isAmd) {
        define(mod);
    } else if (isCommonJs) {
        module.exports = mod;
    }

}('jFunction', jFunction));
