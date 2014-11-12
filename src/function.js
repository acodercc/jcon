/**
 *
 * 对javascript中function类型进行增强
 *
 *  在javascript中，function是第一类型，如想要对function的结果进行链式的DSL改造
 *  可能的方案是对function进行封装为新的function
 *
 *  另一种方案，我们创建一个jFunction类型的对象
 *  该jFunciton拥有一个_成员，指向要封装的function，使该function没有机会直接被外部调用
 *  只暴露给外部一个call接口，来调用该实际封装起来的命名为_的function
 *
 *  那么我们有时机，对该被封装的，命名为_的function进行AOP切面操作，或者链式等内部DSL的增强
 *
 */

var jFunction = (function(){

    var slice = Array.prototype.slice;

    return jObject.create({

        /**
         *
         */
        initializer: function(f){
            this._ = f;
            return this;
        },

        /**
         *
         */
        call: function(self){
            return this._.apply(slice.call(arguments, 1));
        }
    });

}());
