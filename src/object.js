/**
 * jObject
 *
 * 为javascript Object提供基于Object.create和mixin的，可使用隐式上下文DSL的继承和混入
 * 
 * 参考：http://javascript.crockford.com/prototypal.html
 * 参考：http://my.safaribooksonline.com/book/software-engineering-and-development/ide/9780132107549/common-topics/contextvariable_
 *
 */
var jObject = (function(undefined){

    var create = Object.create || function(o){ function F(){} f.prototype = o; return new F;},
    hasOwn = Object.prototype.hasOwnProperty;


    function mixin(){
        for(var i=0,len=arguments.length,o; i<len; i++){
            o = arguments[i];
            for(var k in o) if(hasOwn.call(o, k)) {
                this[k] = o[k]
            }
        }
        return this;
    }

    return {

        /**
         * @method mixin
         *
         * @param {Array:function) arguments 将要被混入this的对象
         *
         * @desc
         *   
         *  这是一个syntactic sugar
         *  源于martin fowler提到的隐式上下文DSL以及链式调用
         *
         *      mixin.call(obj, {a:1}, {b:2}, {c:3}) 等价于 obj.mixin({a:1}, {b:2}).mixin({c:3})
         */
        mixin: mixin,

        /**
         *
         * @method create
         *
         * @param {Array:function} arguments 将要被混入this的对象
         *
         * @desc:
         *
         *  这是一个syntactic sugar
         *  源于douglas crockford提到的begetObject
         *
         *      Object.create(obj) 等价于 obj.create()
         *
         *      mixin.call(Object.create(obj), {a:1}, {b:2}) 等价于 obj.create({a:1}, {b:2})
         *
         *
         */
        create: function(){
            return arguments.length ? mixin.apply(create(this), arguments) : create(this);
        }
    };



    /*  test inherit
    var animal = jObject.create({
        say: function(){
            console.log('....???');
        }
    });

    var sheep = animal.create({
        say: function(){
            console.log('miemie');
        }
    });

    animal.say();
    sheep.say();
    delete sheep.say;
    sheep.say();
    */

}());

(function(identifier, mod){
    var isAmd = typeof define === 'function',
    isCommonJs = typeof module === 'object' && !!module.exports;

    if (isAmd) {
        define(mod);
    } else if (isCommonJs) {
        module.exports = mod;
    }

}('jObject', jObject));
