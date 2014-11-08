/**
 * jObject
 *
 * 为javascript Object提供基于Object.create和mixin的隐式上下文的继承，以及AOP能力
 */
(function(global){

    var create = Object.create || function(o){ function F(){} f.prototype = o; return new F;},
    slice = Array.prototype.slice,
    hasOwn = Object.prototype.hasOwnProperty;


    function aoplize(){
    }


    /**
     * @mixin
     *
     * @desc 拥有aoplize功能的mixin
     */
    function mixin(){
        var args = slice.call(arguments, 0),
        self = this;

        for(var i=0,len=args.length,k,o; i<len; i++){
            o = args[i];
            for(k in o) if(hasOwn.call(o, k)) {
                self[k] = o[k]
            }
        }
        return self;
    }

    global.jObject = {
        create: function(){
            return arguments.length ? mixin.apply(create(this), arguments) : create(this);
        }
    };

}(this));
