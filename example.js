//
var status = require('./status.js')

status.addItem("Total", {
  max:100, 
  percentage:true,
  color:'cyan'
})

status.addItem("ERR", {
  color:'red'
})

console.log("Starting timer")
var it = 500
var times = 0
var runner = function() {
	times++
  status.updateItem('Total', 5)
  status.updateItem('ERR', 1)
	if(times == 10) {
		status.stamp()
		times = 0
	}
  setTimeout(runner, it)
}
runner()