
var jcon = require('../src/jcon');
console.log( jcon.string('f').not().many().setAst('no-f').parse('abcdefg').ast() );
