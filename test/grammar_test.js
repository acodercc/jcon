/**
 *
 * 针对较为典型的文法编写单元测试
 *
 */
module.exports = {

    grammar: {

        /**
         * @method recursive
         *
         * @desc 对递归文法进行测试
         */
        recursive: function(test){
            var jcon = jcon || require('../src/jcon');
            var left = jcon.string('(');
            var right = jcon.string(')');
            var epsilon = jcon.string('');

            var bracketOpt = jcon.lazy(function(){
                return jcon.or(bracket, epsilon);
            });

            bracket = jcon.seq(left, bracketOpt, right).joinValue();

            test.equal(bracket.parse('').value, null, 'parse "" is null');
            test.equal(bracket.parse('()').value, '()', 'parse "()" is ()');
            test.equal(bracket.parse('())').value, '()', 'parse "())" is ()');
            test.equal(bracket.parse('(())').value, '(())', 'parse "(())" is (())');
            test.equal(bracket.parse('(()').value, null, 'parse "(()" is null');

            test.done();
        }
    }

};
