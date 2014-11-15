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

                test.deepEqual(p1.seq(p2).parse('12').value, ['1','2'], 'seq ok!');
                test.deepEqual(p1.seq(p2, p3).parse('123').value, ['1', '2', '3'], 'seq ok!');


                //seq创建的parser，会创建一层数组结构，将被连接的多个parser的result.value置为数组成员
                //所以每次对seq的调用，都会创建一层数组结构，形成多层深的数组
                test.deepEqual(p1.seq(p2, p3).seq(p4).parse('1234').value, [['1', '2', '3'], '4'], 'seq ok!');

                test.done();
            },

            or: function(test){


                test.equal(p1.or(p2, p3).parse('3').value, '3', 'or ok!');
                test.equal(p1.or(p2,p3).or(p4).parse('4').value, '4', 'or ok!');
                test.equal(p1.or(p2,p3).or(p4).parse('2').value, '2', 'or ok!');

                test.done();

            },
            times: function(test){

                test.deepEqual(p1.times(0, 1).parse('1').value, ['1'], 'times ok!');
                test.deepEqual(p1.times(0, 2).parse('111').value, ['1','1'], 'times ok!');
                test.deepEqual(p1.times(1, Infinity).parse('').success, false, 'times ok!');

                test.done();
            },
            least: function(test){

                test.deepEqual(p1.least(1).parse('1').value, ['1'], 'least ok!');
                test.equal(p1.least(2).parse('1').success, false, 'least ok!');
                test.deepEqual(p1.least(2).parse('111').value, ['1','1','1'], 'least ok!');
                test.done();
            },
            most: function(test){
                test.deepEqual(p1.most(2).parse('111').value, ['1', '1'], 'most ok!');
                test.deepEqual(p1.most(2).parse('1').value, ['1'], 'most ok!');
                test.done();
            },
            many: function(test){
                test.deepEqual(p1.many().parse('111').value, ['1','1','1'], 'many ok!');
                test.done();
            },
            process: function(test){
                var numberParser = p1.process(function(ret){
                    ret.value = parseInt(ret.value, 10);
                });

                test.strictEqual(numberParser.parse('1').value, 1, 'process ok!')
                test.done();
            },
            joinValue: function(test){

                test.equal(p1.seq(p2, p3, p4).joinValue().parse('1234').value, '1234', 'joinValue ok!');

                test.done();
            }
        }
    };
}());
