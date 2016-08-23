var status = require('../status.js');

console.log('Starting a simple status bar to run while doing work.');

status.start({
  pattern: '{spinner.dots} Loading stuff'
});

setTimeout(status.stop, 5000);
