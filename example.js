//
var status = require('./status.js')
  , os = require('os')
  , console = status.console()

var total = status.addItem('total', {
  max: 100
})

var err_count = status.addItem("ERR", {
  label: 'errors'
})

var pizza = status.addItem('pizza', {
  label: 'pizza eaten',
  max: 12,
  count: 4,
  precision: 0,
  custom: function () {
    return `${this.count} slices`;
  }
})


status.pattern = '{timestamp} | {total.spinner} {total.percentage}';

console.log("Starting timer for status bar example...")

var it = 500
var times = 0
var runner = function() {
	times++
  if (times % 3 === 0)
    total.inc(5)
  err_count.inc()
  if (times % 2 === 0)
    pizza.inc()
	if(times % 10 === 0) {
		console.log("Logging something arbirtrary", total.count, err_count.count)
	}
  if(times < 15) {
    setTimeout(runner, it)
  } else {
    status.stop()
  }
}

status.start({
  invert: false,
  pattern: '{uptime.green} | {total.label} {spinner.cyan} {total.percentage}  |  {pizza.green.bar} {pizza.custom.magenta}'
})
runner()
