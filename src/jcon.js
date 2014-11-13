/**
 *
 * jcon 
 *
 * A JavaScript parser combinator Library
 *
 */
var jcon = (function(undefined){

    var slice = Array.prototype.slice;

    function Parser(f){

        return jFunction.create({
            /**
             * @method parse
             *
             */
            parse: function(){
                arguments[1] = arguments[1] || 0;
                return this.__fun__.apply(this, arguments);
            },

            /**
             * @method seq
             *
             * @param {Array:Parser}
             *
             * @desc 使用this指向的当前解析器，和arguments中的解析器，进行连接运算，产生新的连接解析器
             *
             */
            seq: function(){
                var args = slice.call(arguments, 0);
                args.unshift(this);
                return jcon.seq.apply(jcon, args);
            },

            /**
             * @method or
             *
             * @param {Array:Parser}
             *
             * @desc 使用this指向的当前解析器，和arguments中的解析器，进行或运算，产生新的或解析器
             *
             */
            or: function(){
                var args = slice.call(arguments, 0);
                args.unshift(this);
                return jcon.or.apply(jcon, args);
            },

            /**
             *
             * @method times
             *
             * @param {number} min
             * @param {number} max
             *
             * @desc 返回this指向的当前parser的min到max次解析的解析器
             *
             */
            times: function(min, max){
                return jcon.times(this, min, max);
            },

            /**
             * @method process
             *
             * @param {function} proc
             *
             * @desc 对当前解析器函数对象的结果进行指定的处理
             *
             */
            process: function(proc){
                var self = this;
                return Parser(function(stream, index){
                    var result = self.parse(stream, index);
                    result = proc(result) || result;
                    return result;
                });
            },

            /**
             * @method joinValue
             *
             * @param {string} separator 将数组形式的result.value连接为字符串形式时使用的分隔符，默认为空字符串''
             *
             * @desc 对当前解析器函数对象执行后的结果的value值，进行合并
             *
             */
            joinValue: function(separator){

                separator = separator || '';
                return this.process(function(result){
                    if(!!result.success && result.value instanceof Array){
                        result.value = result.value.join(separator);
                    }
                });
            }



        }).initialize(f);
    }

    /**
     * 原子解析器的构造器，基于给定的模式（STR或RE），返回一个进行模式匹配（解析）的函数
     */
    return jObject.create({

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
            return Parser(function(stream, index){
                if(stream.substr(index, str.length) === str){
                    return success(index + str.length, str);
                }else{
                    return fail(index, str);
                }
            });
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
            return Parser(function(stream, index){
                var match = re.exec(stream.slice(index));

                if(match && match[grp]){
                    return success(index+match[0].length, match[grp]);
                }
                return fail(index, re);
            });
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
            return Parser(function(stream, index){
                return success(index, value);
            });
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
            return Parser(function(stream, index){
                return fail(index, expected);
            });
        },

        /**
         * @method chr
         *
         * @param {string} chr
         *
         * @desc 对当前输入流进行单个字符的匹配
         */
        chr: function(chr){
            return Parser(function(stream, index){
                if(stream[index] === chr){
                    return success(index+1, chr);
                }
                return fail(index, chr);
            });
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
            return Parser(function(stream, index){
                if(str.indexOf(stream[index])>-1){
                    return success(index+1, stream[index]);
                }
                return fail(index, 'in ' + str);
            });
        },

        /**
         * @method noInStr
         *
         * @param str
         *
         * @desc 如果当前输入流下一个字符不在给定的字符串中，则返回成功状态
         */
        noInStr: function(str){
            return Parser(function(stream, index){
                if(str.indexOf(stream[index]) === -1){
                    return success(index+1, stream[index]);
                }
                return fail(index, 'no in '+ str);
            });
        },

        /**
         * @method until
         *
         * @param {function} assert
         *
         * @desc 不断的在输入流上进行匹配，直到不符合断言，将符合断言的串返回
         */
        until: function(assert){
            return Parser(function(stream, index){
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
            });
        },

        /**
         * @method lazy
         *
         * @param {function} getParser
         *
         * @desc 解析规则由解析动作发生时才提供
         */
        lazy: function(getParser){

            return Parser(function(stream, index){
                var parser = getParser();
                return parser.parse(stream, index);
            });
        },

        /**
         * @method seq
         *
         * @param {Array:Parser} arguments      n个将要被以顺序方式组合的解析器
         *
         * @desc  进行解析器的顺序组合
         */
        seq: function(){
            var args = slice.call(arguments, 0);

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
         * @param {Array:Parser} arguments        n个选择器，依次尝试匹配，返回第一个成功的
         *
         * @desc 进行解析器的或组合
         */
        or: function(){
            var args = slice.call(arguments, 0);

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
         * @param {Parser} parser
         * @param {number} min
         * @param {number} max
         *
         * @desc 在当前输入流上，使用指定的parse进行最少min次，最多max次的匹配
         *
         */
        times: function(parser, min, max){
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
}());
