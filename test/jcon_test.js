/**
 *
 * 针对jcon命名空间下的各个基础的解析器生成函数编写单元测试
 *
 */
module.exports = (function(){
    var jcon = require('../src/jcon');


    return {
        jcon: {
            string: function(test){
                test.equal(jcon.string('takumi4ichi').parse('takumi4ichi').value, 'takumi4ichi', 'jcon.string');
                test.done();
            },
            regex: function(test){
                test.equal(jcon.regex(/\.(\w+)/, 1).parse('.item').value, 'item', 'jcon.regex');

                //必须让正则解析器有解析空字符串仍解析成功的能力，即模式本身可以是一个空串
                test.equal(jcon.regex(/1?/).parse('').value, '', 'jcon.regex');
                test.done();
            },
            not: function(test){
                test.equal(jcon.string('123').not().parse('123').success, false, 'jcon.not');
                test.equal(jcon.string('123').not().parse('223').value, '2', 'jcon.not');
                test.equal(jcon.string('123').not().not().parse('123').value, '1', 'jcon.not');

                test.done();
            },
            success: function(test){
                test.equal(jcon.success('success value').parse('').value, 'success value', 'jcon.success');
                test.done();
            },
            fail: function(test){
                test.equal(jcon.fail('fail expected').parse('').expected, 'fail expected', 'jcon.fail');
                test.done();
            },
            chr: function(test){
                test.equal(jcon.chr('a').parse('abc').value, 'a', 'jcon.chr');
                test.done();
            },
            inStr: function(test){
                test.equal(jcon.inStr('abc').parse('b').value, 'b', 'jcon.inStr');
                test.done();
            },
            noInStr: function(test){
                test.equal(jcon.noInStr('abc').parse('k').value, 'k', 'jcon.noInStr');
                test.equal(jcon.noInStr('abc').parse('').success, false, 'jcon.noInStr');
                test.done();
            },
            until: function(test){
                var letters = jcon.until(function(chr){
                    return /^[a-z]$/.test(chr);
                })
                test.deepEqual(letters.parse('abcDEF').value, ['a','b','c'], 'jcon.until');
                test.done();
            },
            lazy: function(test){


                var currentSecondParser = jcon.lazy(function(){
                    //返回一个匹配当前时间中秒数的解析器
                    return jcon.string((new Date).getSeconds()+'');
                });

                test.equal(currentSecondParser.parse((new Date).getSeconds()+'').success, true, 'jcon.lazy');
                test.done();
            }
        }
    };
}());
