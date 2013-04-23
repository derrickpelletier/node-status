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
  type:['bar','percentage'],
  max:8,
  precision:0
})

status.updateItem('pizza', 1)
console.log("Starting timer")


var it = 500
var times = 0
var runner = function() {
	times++
  status.updateItem('total', 5)
  status.updateItem('ERR', 1)
	if(times == 10) {
		// status.stamp()c
		times = 0
	}
  setTimeout(runner, it)
}
runner()