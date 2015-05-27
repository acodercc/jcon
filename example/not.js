
var jcon = require('../src/jcon');
console.log( jcon.string('ff').not().many().setAst('no-f').parse('abcdefghijkff').ast() );
