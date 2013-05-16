//
var status = require('./status.js'),
    os = require('os'),
		console = status.console()

var total = status.addItem("total", {
  max:100, 
  type:"percentage",
  color:'cyan'
})

var err_count = status.addItem("ERR", {
  color:'red',
  label:'errors'
})

var pizza = status.addItem({
  name: 'pizza eaten',
  color:'green',
  type:[function(item){ return item.count + " slice" + (item.count === 0 || item.count > 1 ? "s" : "") }, 'bar', 'percentage'],
  max:8,
  count: 4,
  precision:0
})


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
	if(times == 10) {
		console.log("Logging something arbirtrary", total.count, err_count.count)
		times = 0
	}
  setTimeout(runner, it)
}

status.startAutoStamp()
runner()
