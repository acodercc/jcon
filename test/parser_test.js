module.exports = (function(){

    var jcon = require('../src/jcon');

    var p1 = jcon.string('1');
    var p2 = jcon.string('2');
    var p3 = jcon.string('3');
    var p4 = jcon.string('4');

    return {
        seq: function(test){

            test.deepEqual(p1.seq(p2).parse('12').value, ['1','2'], 'seq ok!');
            test.deepEqual(p1.seq(p2, p3).parse('123').value, ['1', '2', '3'], 'seq ok!');
            test.deepEqual(p1.seq(p2, p3).seq(p4).parse('1234').value, ['1', '2', '3', '4'], 'seq ok!');

            test.done();
        },
        or: function(test){


            test.equal(p1.or(p2, p3).parse('3').value, '3', 'or ok!');
            test.equal(p1.or(p2,p3).or(p4).parse('4').value, '4', 'or ok!');

            test.done();

        },
        times: function(test){
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
    };
}());
