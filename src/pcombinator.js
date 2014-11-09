/**
 *
 */
(function(global){

    var slice = Array.prototype.slice;

    var base = jObject.create({

        /**
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
     * 增加组合子
     */
    var combinator = base.create({
        /**
         *
         */
        seq: function(){
            var args = slice.call(arguments, 0);

            return function(stream, index){
                var curindex = index,
                values = [],
                result;
                while(parse = args.shift()){
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
