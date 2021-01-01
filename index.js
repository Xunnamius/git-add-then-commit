const program = new (require('commander').Command)();
program.version(require('./package.json').version);

const natural = require('string-natural-compare');
const { readFile, writeFile } = require('fs/promises');

