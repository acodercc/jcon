/**
 * jObject
 *
 * 为javascript Object提供基于Object.create和mixin的隐式上下文的继承，以及AOP能力
 */
(function(global){

    var create = Object.create || function(o){ function F(){} f.prototype = o; return new F;},
    slice = Array.prototype.slice,
    hasOwn = Object.prototype.hasOwnProperty,
    posRE = /^(after|before)/;


    /**
     * @function aoplize
     *
     * @desc 为当前对象上的某个方法建立前切面或后切面
     *
     */
    function aoplize(k, fun){
        var self = this,
        pos = k.match(posRE)[0],
        k = origKey(k),
        origMethod = self[k];

        self[k] = {
            /**
             * 前切面
             */
            before: function(){
                fun.apply(this, arguments);
                return origMethod.apply(this, arguments);
            },
            /**
             * 后切面
             */
            after: function(){
                var args = slice.call(arguments, 0);
                var ret = origMethod.apply(this, args);
                args.unshift(ret);
                return fun.apply(this, args);
            }
        }[pos];
    }

    /*
    var a = {
        say: function(){
            console.log('hi');
        }
    };
    aoplize.call(a, 'beforeSay', function(){
        console.log('ready say');
    });
    aoplize.call(a, 'afterSay', function(){
        console.log('sayed');
    });

    a.say();
    */

    
    /**
     * @function origKey
     *
     * @param {string} k   like afterInit
     *
     * @return {string} like init
     *
     * @desc afterInit -> init     beforeInit -> init
     */
    function origKey(k){
        return k.replace(posRE, '').replace(/^([A-Z])/, function(_, chr){
            return String.fromCharCode(chr.charCodeAt(0)+32);
        });
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
                if(posRE.test(k) && typeof o[k] === 'function'){
                    aoplize.call(self, k, o[k]);
                }else{
                    self[k] = o[k]
                }
            }
        }
        return self;
    }

    global.jObject = {

        mixin: mixin,

        /**
         * @desc:
         *  a syntactic sugar: 
         *      Object.create(obj) 等价于 obj.create()
         *      mixin.call(Object.create(obj), {a:1}) 等价于 obj.create({a:1})  隐式上下文dsl
         *
         */
        create: function(){
            return arguments.length ? mixin.apply(create(this), arguments) : create(this);
        }
    };



    /*  test inhert
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


    /* test aoplize
    var peopleId=0;
    var people = jObject.create({
        init: function peopleInit(name){
            this.name = name;
            this.id = ++peopleId;
            return name === 'cc' ? 'cc is god' : '';
        }
    });

    var aliEmployee = people.create({
        afterInit: function aliEmployeeInit(parentInitRet, name, employeeId){
            this.employeeId = employeeId;
            if(parentInitRet){
                this.desc = parentInitRet;
            }
        }
    });

    var me = aliEmployee.create();
    me.init('cc', 64855);
    console.log(me);

    var jackMa = aliEmployee.create();
    jackMa.init('jackMa', 1);
    console.log(jackMa);
    */


}(this));
