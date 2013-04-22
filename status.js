var colors = require('colors')
var start = new Date().getTime()
var pad = "  "
var Item = function(options) {
	this.label = options.label
	this.count = 0
	options.count && (this.count = options.count)
	options.max && (this.max = options.max)
	options.percentage &&	(this.percentage = true)
	options.color && (this.color = colors[options.color])
}

var items = {}

var render = function(stamp){
	var out = ""
  for (var i in items) {
    var c = items[i]
    var text = c.color ? c.color(c.label) : c.label
    var nums = c.count
    if(c.max && c.percentage) {
    	nums = (100 * c.count/c.max).toFixed(3) + " %"
    } else if (c.max) {
    	nums += "/" + c.max
    }
    out += "|" + pad + text + ": " + nums + pad
  }
  out +=  " |"
  if(stamp) {
  	process.stdout.write("\u001B[2K")
  	console.log((new Date().getTime() - start) + "ms " + out + "\r")
  }
  process.stdout.write("  Status: " + out + "\r")
}

exports.addItem = function(label, options){
	options.label = label
	items[label] = new Item(options)
}

exports.list = function(){
	console.log(items.length)
}

exports.updateItem = function(item, amount) {
	item = items[item]
	item.count += amount
	if(item.max != undefined) item.count = Math.min(item.count, item.max)
	render()
}

exports.stamp = function() {
	render(true)
}