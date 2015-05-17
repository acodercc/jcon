/**
 *
 * jcon 
 *
 * A JavaScript parser combinator Library
 *
 */
var jcon = (function(undefined){

    var slice = Array.prototype.slice,
    jObject = require('./object'),
    jFunction = require('./function.js');

    var result = jObject.create({
        ast: function(){
            var root = [],
            current = root,
            stack = [root];

            /**
             * 
             */
            function transAstNode(result){
                return {
                    type: result.astType || result.type,
                    value: result.value
                };
            }

            /**
             * @function visitParseTree
             *
             * @desc 从解析树到语法树
             *
             */
            function visitParseTree(result){
                var astNode;
                if(!!result.isAst){
                    astNode = transAstNode(result);
                    current.push(astNode);
                }
                if(result.rhs){
                    if(!!result.isAst){
                        current = astNode.childs = [];
                        stack.push(current);
                    }
                    for(var i=0; i<result.rhs.length; i++){
                        visitParseTree(result.rhs[i]);
                    }
                    if(astNode && astNode.childs instanceof Array && !astNode.childs.length){
                        delete astNode.childs;
                    }
                    if(!!result.isAst){
                        stack.pop()
                        current = stack[stack.length-1];
                    }
                }
            }
            visitParseTree(this);
            return root;
        }
    });

    function Parser(f){

        return jFunction.create(

        //尾处理器process及基于尾处理器的尾处理dsl
        {

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
             * @method flat
             *
             * @desc 将当前解析器解析出的value值进行数组平坦化(非深度平坦化，只针对当前结果数组中的每个元素，如是数组则合并，如不是数组则保持，并不进行递归
             */
            flat: function(){
                return this.process(function(result){
                    if(!!result.success && result.value instanceof Array){
                        var flats = [];
                        for(var i=0,len=result.value.length; i<len; i++){
                            if(result.value[i] instanceof Array){
                                flats = flats.concat(result.value[i]);
                            }else{
                                flats.push(result.value[i]);
                            }
                        }
                        result.value = flats;
                    }
                });
            },

            /**
             * @method skip
             *
             * @desc 将当前解析器的结果值加入skip的flag，在seq,times等合并解析结果时忽略该解析器的值
             */
            skip: function(){
                return this.process(function(result){
                    result.skip = true;
                });
            },

            /**
             * @method type
             * @param {string} type
             *
             * @desc 设置当前解析器解析结果的类型
             */
            type: function(type){
                return this.process(function(result){
                    result.type = type;
                });
            },
            setAst: function(astType){
                return this.process(function(result){
                    result.isAst = true;
                    result.astType = astType || result.type;
                });
            }
        },


        {
            /**
             * @method parse
             *
             */
            parse: function(){
                var args = slice.call(arguments, 0);
                args[1] = args[1] || 0;
                return this.__fun__.apply(this, args);
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
             *
             * @method least
             *
             * @param {number} min
             *
             * @desc 返回this指向的当前parser的{{最少min次}}解析的解析器
             *
             */
            least: function(min){
                return this.times(min, Infinity);
            },

            /**
             * @method most
             *
             * @param {number} max
             *
             * @desc 返回this指向的当前parser的{{最多max次}}解析的解析器
             *
             */
            most: function(max){
                return this.times(0, max);
            },

            /**
             * @method many
             *
             * @desc 将当前解析器封装为进行{{0或尽量多的任意次}}匹配当前输入流的新解析器
             *
             */
            many: function(){
                return this.least(0);       //equal return this.most(Infinity);
            },


            /**
             * @method possible
             *
             * @desc 将当前解析器封装为进行0或1次匹配当前输入流的新解析器
             *
             */
            possible: function(){
                return this.most(1);
            },


            /**
             * @method lookhead
             *
             * @param {parser} lookhead 积极前瞻解析器
             *
             * @desc 当原解析器在当前输入流解析成功后，需要前瞻解析器在原解析器解析后的位置再次解析成功，原解析器才是解析成功的
             *
             */
            lookhead: function(){
                var args = slice.call(arguments, 0);
                args.unshift(this);

                return jcon.lookhead.apply(jcon, args);
            },

            /**
             * @method noLookhead
             *
             * @param {parser} noLookhead 消极前瞻解析器
             *
             * @desc 当原解析器在当前输入流解析成功后，需要前瞻解析器在原解析器解析后的位置再次解析失败，原解析器才是解析成功的
             *
             */
            noLookhead: function(){
                var args = slice.call(arguments, 0);
                args.unshift(this);

                return jcon.noLookhead.apply(jcon, args);
            }

        }
        
        ).initialize(f);
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
                    return success(index, str);
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

                if(match && match[grp] !== undefined){
                    return success(index, match[grp]);
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
                    return success(index, chr);
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
                    return success(index, stream[index]);
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
                    return success(index, stream[index]);
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
                currentIndex = index,
                chr;
                while(assert(stream[currentIndex])){
                    values.push(stream[currentIndex]);
                    currentIndex++;
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
                results = [],
                result,
                parserIndex = 0,
                parser;
                while(parser = args[parserIndex++]){
                    result = parser.parse(stream, currentIndex);
                    if(result.success){
                        currentIndex = result.endIndex;
                        if(!result.skip && result.value !== ""){
                            values.push(result.value);
                            results.push(result);
                        }
                    }else{
                        return fail(currentIndex, '');
                    }
                }
                return success(index, values.join(''), {rhs: results, endIndex: currentIndex});
            });
        },


        /**
         * @method or
         *
         * @param {Array:Parser} arguments        n个选择器，依次尝试匹配，返回最长的成功的
         *
         * @desc 进行解析器的或组合
         */
        or: function(){
            var args = slice.call(arguments, 0);

            return Parser(function(stream, index){
                var parser,
                result,
                results = [],
                parserIndex = 0;
                while(parser = args[parserIndex++]){
                    result = parser.parse(stream, index);
                    if(result.success){
                        results.push(result);
                    }
                }
                if(results.length){
                    results.sort(function(a, b){return b.endIndex - a.endIndex;});
                    return results[0];
                }else{
                    return fail(index, 'in or_parser');
                }
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
                result,
                values = [],
                results = [],
                endIndex = index;       //因为会有skip-flag的存在，所以endIndex的计算不能使用startIndex+value.length

                do{
                    result = parser.parse(stream, result ? result.endIndex : index);
                    if(result.success){
                        endIndex = result.endIndex;
                        successTimes++;
                        if(!result.skip && result.value !== ""){
                            values.push(result.value);
                            results.push(result);
                        }
                        if(successTimes === max){
                            break;
                        }
                    }
                }while(result.success);

                if(successTimes >= min && successTimes <= max){
                    return success(index, values.join(''), {rhs: results, endIndex: endIndex});
                }else{
                    return fail(index, '');
                }
            });
        },

        /**
         * @method lookhead
         *
         * @param {Parser} parser   原解析器
         * @param {parser} lookhead 积极前瞻解析器
         *
         * @desc 当原解析器在当前输入流解析成功后，需要前瞻解析器在原解析器解析后的位置再次解析成功，原解析器才是解析成功的
         *
         */
        lookhead: function(parser, lookhead){
            return Parser(function(stream, index){
                var result = parser.parse(stream, index);

                if(result.success){

                    var lookheadResult = lookhead.parse(stream, result.endIndex);

                    //在原解析器匹配成功时，但lookhead解析器匹配失败时，仍报错
                    if(!lookheadResult.success){
                        return fail(index, 'lookhead fail!');
                    }
                }
                return result;
            });
        },
        /**
         * @method noLookhead
         *
         * @param {Parser} parser   原解析器
         * @param {parser} noLookhead 消极前瞻解析器
         *
         * @desc 当原解析器在当前输入流解析成功后，需要消极前瞻解析器在原解析器解析后的位置解析失败，原解析器才是解析成功的
         *
         */
        noLookhead: function(parser, lookhead){
            return Parser(function(stream, index){
                var result = parser.parse(stream, index);

                if(result.success){

                    var lookheadResult = lookhead.parse(stream, result.endIndex);

                    //在原解析器匹配成功时，但noLookhead解析器匹配又成功时，就进行报错
                    if(lookheadResult.success){
                        return fail(index, 'noLookhead fail!');
                    }
                }
                return result;
            });
        }

    });



    /**
     * @function success
     * 
     * @param {number} index            匹配成功的位置
     * @param {string} value            匹配到的值
     * @param {object} more             更多的信息
     */
    function success(index, value, more){
        return result.create({
            success: true,
            startIndex: index,
            endIndex: index + value.length,
            length: value.length,
            value: value,
            expected: '',
            lastIndex: -1
        }, more);
    }

    /**
     * @function fail
     * 
     * @param {number} lastIndex        匹配失败的位置
     * @param {string} expected         期望匹配到的值
     * @param {object} more             更多的信息
     */
    function fail(lastIndex, expected, more){
        return jObject.create({
            success: false,
            index: -1,
            value: null,
            expected: expected,
            lastIndex: lastIndex
        }, more);
    }
}());

(function(identifier, mod){
    var isAmd = typeof define === 'function',
    isCommonJs = typeof module === 'object' && !!module.exports;

    if (isAmd) {
        define(mod);
    } else if (isCommonJs) {
        module.exports = mod;
    }

}('jcon', jcon));
