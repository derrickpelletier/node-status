//
var status = require('./status.js')

status.addItem("Total", {
  max:100, 
  type:"percentage",
  color:'cyan'
})

status.addItem("ERR", {
  color:'red'
})

status.addItem("Pizza", {
  color:'green',
  type:['bar','percentage'],
  max:50,
  precision:0
})

console.log("Starting timer")
var it = 500
var times = 0
var runner = function() {
	times++
  status.updateItem('Total', 5)
  status.updateItem('ERR', 1)
  status.updateItem('Pizza', 1)
	if(times == 10) {
		// status.stamp()
		times = 0
	}
  setTimeout(runner, it)
}
runner()