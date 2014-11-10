/**
 *
 * P-Combinator
 *
 * A JavaScript parser combinator Library
 *
 */
(function(global){

    var slice = Array.prototype.slice;

    /**
     * 原子解析器的构造器，基于给定的模式（STR或RE），返回一个进行模式匹配（解析）的函数
     */
    var generator = jObject.create({

        /**
         * @method string
         *
         * @param {string} str
         *
         * @return {function} 
         *
         * @desc 基于一个给定的字符串，创建一个parse函数
         *
         */
        string: function(str){
            return function(stream, index){
                if(stream.substr(index, str.length) === str){
                    return success(index + str.length, str);
                }else{
                    return fail(index, str);
                }
            };
        },

        /**
         * @method regex
         *
         * @param {regex} re            正则表达式
         * @param {number} opt grp      捕获组，默认为0
         */
        regex: function(re, grp){
            grp = grp || 0;

            //对正则进行处理，加入^符号，从被截取的输入流开头进行匹配
            re = eval(re.toString().replace(/^\//, '/^'));
            return function(stream, index){
                var match = re.exec(stream.slice(index));

                if(match && match[grp]){
                    return success(index+match[0].length, match[grp]);
                }
                return fail(index, re);
            };
        }
    });

    /**
     * 解析器的组合器（将多个解析器以 seq,or,times 等方式组合为新的解析器）
     */
    var combinator = generator.create({
        /**
         * @method seq
         *
         * @param {Array:function} arguments      n个将要被以顺序方式组合的解析器
         *
         * @return {function} 组合后的解析器函数
         *
         * @desc  进行解析器的顺序组合
         */
        seq: function(){
            var args = slice.call(arguments, 0);

            return function(stream, index){
                var curindex = index,
                values = [],
                result,
                parserIndex = 0;
                while(parse = args[parserIndex++]){
                    result = parse(stream, curindex);
                    if(result.success){
                        curindex = result.index;
                        values.push(result.value);
                    }else{
                        return fail(curindex, '');
                    }
                }
                return success(curindex, values);
            };
        }
    });


    global.PCombinator = combinator;



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


}(this));
