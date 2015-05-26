/**
 *
 * 针对parser实例的各个组合子（解析器的组合函数）编写单元测试
 *
 */
module.exports = (function(){

    var jcon = require('../src/jcon');

    var p1 = jcon.string('1');
    var p2 = jcon.string('2');
    var p3 = jcon.string('3');
    var p4 = jcon.string('4');

    return {
        parser:{
            seq: function(test){

                test.deepEqual(p1.seq(p2).parse('12').value, '12', 'seq');
                test.deepEqual(p1.seq(p2).parse('12').rhs.map(function(r){return r.value}), ['1', '2'], 'seq');

                test.deepEqual(p1.seq(p2, p3).parse('123').value, '123', 'seq');


                //seq创建的parser，会创建一层数组结构，将被连接的多个parser的result.value置为数组成员
                //所以每次对seq的调用，都会创建一层数组结构，形成多层深的数组
                test.deepEqual(p1.seq(p2, p3).seq(p4).parse('1234').value, '1234', 'seq');

                test.done();
            },
            flat: function(test){
                test.deepEqual(p1.seq(p2, p3).seq(p4).flat().parse('1234').value, '1234', 'flat');
                test.done();
            },

            or: function(test){


                test.equal(p1.or(p2, p3).parse('3').value, '3', 'or');
                test.equal(p1.or(p2,p3).or(p4).parse('4').value, '4', 'or');
                test.equal(p1.or(p2,p3).or(p4).parse('2').value, '2', 'or');

                test.done();

            },
            times: function(test){

                test.deepEqual(p1.times(0, 1).parse('1').value, '1', 'times');
                test.deepEqual(p1.times(0, 1).parse('1').rhs.map(function(r){return r.value}), ['1'], 'times');

                test.deepEqual(p1.times(0, 2).parse('111').value, '11', 'times');
                test.deepEqual(p1.times(0, 2).parse('111').rhs.map(function(r){return r.value}), ['1','1'], 'times');

                test.deepEqual(p1.times(1, Infinity).parse('').success, false, 'times');

                test.done();
            },
            least: function(test){

                test.deepEqual(p1.least(1).parse('1').value, '1', 'least');
                test.deepEqual(p1.least(1).parse('1').rhs.map(function(r){return r.value}), ['1'], 'least');

                test.equal(p1.least(2).parse('1').success, false, 'least');

                test.deepEqual(p1.least(2).parse('111').value, '111', 'least');
                test.deepEqual(p1.least(2).parse('111').rhs.map(function(r){return r.value}), ['1','1','1'], 'least');

                test.done();
            },
            most: function(test){
                test.deepEqual(p1.most(2).parse('111').rhs.map(function(r){return r.value}), ['1', '1'], 'most');
                test.deepEqual(p1.most(2).parse('1').rhs.map(function(r){return r.value}), ['1'], 'most');
                test.done();
            },
            possible: function(test){
                test.deepEqual(p1.possible().parse('111').rhs.map(function(r){return r.value}), ['1'], 'most');
                test.deepEqual(p1.possible().parse('1').rhs.map(function(r){return r.value}), ['1'], 'most');
                test.equal(p1.possible().parse('').success, true, 'most');//即使没有匹配到也是成功匹配
                test.done();
            },
            many: function(test){
                test.deepEqual(p1.many().parse('111').rhs.map(function(r){return r.value}), ['1','1','1'], 'many');
                test.equal(p1.many().parse('').success, true, 'many');
                test.done();
            },
            process: function(test){
                var numberParser = p1.process(function(ret){
                    ret.value = parseInt(ret.value, 10);
                });

                test.strictEqual(numberParser.parse('1').value, 1, 'process')
                test.done();
            },
            lookhead: function(test){
                test.equal(jcon.lookhead(p1,jcon.string('a')).parse('1a').value, '1', 'lookhead');
                test.equal(p1.lookhead(jcon.string('a')).parse('1a').value, '1', 'lookhead');
                test.equal(p1.lookhead(jcon.string('b')).parse('1a').success, false, 'lookhead');
                test.equal(p1.lookhead(jcon.string('a')).parse('2a').success, false, 'lookhead');

                test.done();
            },
            noLookhead: function(test){
                test.equal(jcon.noLookhead(p1,jcon.string('a')).parse('1b').value, '1', 'noLookhead');
                test.equal(jcon.noLookhead(p1,jcon.string('a')).parse('1a').success, false, 'noLookhead');
                test.equal(p1.noLookhead(jcon.string('a')).parse('1a').success, false, 'noLookhead');
                test.equal(p1.noLookhead(jcon.string('a')).parse('1b').success, true, 'noLookhead');
                test.equal(p1.noLookhead(jcon.string('a')).parse('2b').success, false, 'noLookhead');

                test.done();
            },
            skip: function(test){

                test.deepEqual(p1.seq(p2,p3.skip(),p4).parse('1234').value, '124', 'skip 124');
                test.deepEqual(p1.seq(p2.skip().many(), p3).parse('122223').value, '13', 'skip 13');
                test.deepEqual(p1.seq(p2.many().skip(), p4).parse('122224').value, '14', 'skip 14');

                test.done();
            },

            type: function(test){

                test.equal(p1.type('number').parse('1').type, 'number', 'type');

                test.done();

            },

            ast: function(test){

                test.deepEqual(p1.seq(p2.setAst(),p3,p4.setAst()).parse('1234').ast().map(function(r){return r.value}), ['2', '4'], 'ast');
                test.done();

            }
        }
    };
}());
