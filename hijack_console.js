const fs = require('fs');

const originalError = console.error;
console.error = function(...args) {
  fs.appendFileSync('nodemon_error.log', new Date().toISOString() + ' ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') + '\n');
  originalError.apply(console, args);
};

const originalLog = console.log;
console.log = function(...args) {
  fs.appendFileSync('nodemon_log.log', new Date().toISOString() + ' ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') + '\n');
  originalLog.apply(console, args);
};
