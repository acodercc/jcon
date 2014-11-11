/**
 *
 * jcon 
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
        },

        /**
         * @method success
         *
         * @param {string} value
         *
         * @desc 直接在输入流的当前位置返回一个成功状态
         *
         */
        success: function(value){
            return function(stream, index){
                return success(index, value);
            };
        },

        /**
         * @method fail
         *
         * @param {string} expected
         *
         * @desc 直接在当前输入流上返回一个失败状态
         *
         */
        fail: function(expected){
            return function(stream, index){
                return fail(index, expected);
            };
        },

        /**
         * @method chr
         *
         * @param {string} chr
         *
         * @desc 对当前输入流进行单个字符的匹配
         */
        chr: function(chr){
            return function(stream, index){
                if(stream[index] === chr){
                    return success(index+1, chr);
                }
                return fail(index, chr);
            };
        },

        /**
         * @method instr
         *
         * @param {string} str
         *
         * @desc 如果当前输入流中下一个字符在给定的string中，则返回成功状态
         *
         */
        inStr: function(str){
            return function(stream, index){
                if(str.indexOf(stream[index])>-1){
                    return success(index+1, stream[index]);
                }
                return fail(index, 'in ' + str);
            };
        },

        /**
         * @method noInStr
         *
         * @param str
         *
         * @desc 如果当前输入流下一个字符不在给定的字符串中，则返回成功状态
         */
        noInStr: function(str){
            return function(stream, index){
                if(str.indexOf(stream[index]) === -1){
                    return success(index+1, stream[index]);
                }
                return fail(index, 'no in '+ str);
            };
        },

        /**
         * @method until
         *
         * @param {function} assert
         *
         * @desc 不断的在输入流上进行匹配，直到不符合断言，将符合断言的串返回
         */
        until: function(assert){
            return function(stream, index){
                var values = [],
                chr;
                while(assert(stream[index])){
                    values.push(stream[index]);
                    index++;
                }
                if(values.length){
                    return success(index, values);
                }
                return fail(index, 'assert:' + assert.toString());
            };
        },

        /**
         * @method lazy
         *
         * @param {function} getParser
         *
         * @desc 解析规则由解析动作发生时才提供
         */
        lazy: function(getParser){

            return function(stream, index){
                return getParser().call(this, stream, index);
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
         * @desc  进行解析器的顺序组合
         */
        seq: function(){
            var args = slice.call(arguments, 0);

            return function(stream, index){
                var currentIndex = index,
                values = [],
                result,
                parserIndex = 0,
                parse;
                while(parse = args[parserIndex++]){
                    result = parse(stream, currentIndex);
                    if(result.success){
                        currentIndex = result.index;
                        values.push(result.value);
                    }else{
                        return fail(currentIndex, '');
                    }
                }
                return success(currentIndex, values);
            };
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

            return function(stream, index){
                var parse,
                parserIndex = 0;
                while(parse = args[parserIndex++]){
                    result = parse(stream, index);
                    if(result.success){
                        return success(result.index, result.value);
                    }
                }
                return fail(index, 'in or_parser');
            };
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
        times: function(parse, min, max){
            return function(stream, index){
                var successTimes = 0,
                values = [];

                do{
                    result = parse(stream, index);
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
            };
        }

    });


    global.jcon = combinator;



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
