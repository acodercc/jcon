/**
 *
 * 测试从解析树到语法树的转换
 *
 */
module.exports = {

    grammar: {

        /**
         * @method ast
         *
         * @desc 对ast进行测试
         */
        ast: function(test){
            var jcon = jcon || require('../src/jcon');

            var ident = jcon.regex(/[\w-]+/).type('ident');
            var colon = jcon.string(':');

            var element_name = ident.type('element_name').setAst();

            var pseudo = jcon.seq(colon, ident.setAst('name'), jcon.string('('), ident.setAst('param'), jcon.string(')')).type('pseudo').setAst();

            var selector = jcon.or(pseudo, jcon.seq(element_name, pseudo.least(1)).least(1)).least(1);

            var parseTree = selector.parse('div:nth-child(2n-1)');
            var astTree = parseTree.ast();


            test.deepEqual(astTree, [
                {
                    type: 'element_name',
                    value: 'div'
                },
                {
                    type: 'pseudo',
                    value: ':nth-child(2n-1)',
                    childs: [
                        {
                            type: 'name',
                            value: 'nth-child'
                        },
                        {
                            type: 'param',
                            value: '2n-1'
                        }
                    ]
                }
            ], 'ast');

            test.done();
        }
    }

};
