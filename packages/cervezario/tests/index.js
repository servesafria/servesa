const { argv } = require("process");
const {testix} = require("testix");
let args = (argv.length>2) ? argv.slice(2) : ['**/*.test.js']
testix(...args)