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

                test.done();

            },
            times: function(test){
                test.done();
            },
            least: function(test){
            },
            most: function(test){
            },
            many: function(test){
            },
            process: function(test){
            },
            joinValue: function(test){
            }
        }
    };
}());
