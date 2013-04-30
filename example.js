//
var status = require('./status.js'),
		console = status.console()

status.addItem("total", {
  max:100, 
  type:"percentage",
  color:'cyan'
})

status.addItem("ERR", {
  color:'red',
  label:'errors'
})

status.addItem("pizza", {
  color:'green',
  type:['time', 'bar','percentage'],
  max:8,
  precision:0
})

console.log("Starting timer")

var it = 500
var times = 0
var runner = function() {
	times++
  status.updateCount('total', 5)
  status.updateCount('ERR', 1)
  status.updateCount('pizza', 1)
	if(times == 10) {
		console.log("Logging something arbirtrary", status.getCount('total'))
		times = 0
	}
  setTimeout(runner, it)
}

status.startAutoStamp()
runner()