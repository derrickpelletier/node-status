//
var status = require('./status.js'),
    os = require('os'),
		console = status.console()

status.addItem("total", {
  max:100, 
  type:"percentage",
  color:'cyan'
})

var err_count = status.addItem("ERR", {
  color:'red',
  label:'errors'
})

status.addItem("pizza", {
  color:'green',
  label: "pizza eaten",
  type:[function(item){ return item.count + " slice" + (item.count === 0 || item.count > 1 ? "s" : "") }, 'bar', 'percentage'],
  max:8,
  precision:0
})

console.log("Starting timer for status bar example...")

var it = 500
var times = 0
var runner = function() {
	times++
  if (times % 3 === 0)
    status.updateCount('total', 5)  
  err_count.inc()
  if (times % 2 === 0)
    status.updateCount('pizza', 1)
	if(times == 10) {
		console.log("Logging something arbirtrary", status.getCount('total'), err_count.count)
		times = 0
	}
  setTimeout(runner, it)
}

status.startAutoStamp()
runner()
