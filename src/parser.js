/**
 *
 * Parser函数，继承自jFunction
 *
 */

function Parser(f){

    var parser = jFunction.create({
        parse: function(){
            return this._.apply(this, arguments);
        }
    }).initializer(f);

    var slice = Array.prototype.slice;

    parser.mixin({
        /**
         * @method seq
         *
         * @param {Array:function} arguments      n个将要被以顺序方式组合的解析器
         *
         * @desc  进行解析器的顺序组合
         */
        seq: function(){
            var args = slice.call(arguments, 0);
            args.unshift(this);

            return Parser(function(stream, index){
                var currentIndex = index,
                values = [],
                result,
                parserIndex = 0,
                parser;
                while(parser = args[parserIndex++]){
                    result = parser.parse(stream, currentIndex);
                    if(result.success){
                        currentIndex = result.index;
                        values.push(result.value);
                    }else{
                        return fail(currentIndex, '');
                    }
                }
                return success(currentIndex, values);
            });
        },

        /**
         * @method or
         *
         * @param {Array:function} arguments        n个选择器，依次尝试匹配，返回第一个成功的
         *
         * @desc 进行解析器的或组合
         */
        or: function(){
            var args = slice.call(arguments, 0);
            args.unshift(this);

            return Parser(function(stream, index){
                var parser,
                parserIndex = 0;
                while(parser = args[parserIndex++]){
                    result = parser.parse(stream, index);
                    if(result.success){
                        return success(result.index, result.value);
                    }
                }
                return fail(index, 'in or_parser');
            });
        },

        /**
         * @method times
         *
         * @param {function} parse
         * @param {number} min
         * @param {number} max
         *
         * @desc 在当前输入流上，使用指定的parse进行最少min次，最多max次的匹配
         *
         */
        times: function(min, max){
            var parser = this;
            return Parser(function(stream, index){
                var successTimes = 0,
                values = [];

                do{
                    result = parser.parse(stream, index);
                    if(result.success){
                        index = result.index;
                        successTimes++;
                        values.push(result.value);
                        if(successTimes === max){
                            break;
                        }
                    }
                }while(result.success);

                if(successTimes >= min && successTimes <= max){
                    return success(index, values);
                }else{
                    return fail(index, '');
                }
            });
        }
    });

    return parser;



    /**
     * @function success
     * 
     * @param {number} index            匹配成功的位置
     * @param {string} value            匹配到的值
     */
    function success(index, value){
        return {
            success: true,
            index: index,
            value: value,
            expected: '',
            lastIndex: -1
        };
    }

    /**
     * @function fail
     * 
     * @param {number} lastIndex        匹配失败的位置
     * @param {string} expected         期望匹配到的值
     */
    function fail(lastIndex, expected){
        return {
            success: false,
            index: -1,
            value: null,
            expected: expected,
            lastIndex: lastIndex
        };
    }


}
