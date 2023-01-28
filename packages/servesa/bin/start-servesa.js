import {Servesa} from "../index.js";
console.log('[SERVESA]')
process.title = 'servesa'
let root = process.argv[2] || '.'
Servesa.start(root, ...process.argv.slice(3));
process.on('exit',()=>{
  console.log('[EXITING]')
})