var colors = require('colors')
var start = new Date().getTime()
var pad = "  "

var Item = function(options) {
	this.label = options.label
	this.count = 0
	options.count && (this.count = options.count)
	options.max && (this.max = options.max)
	options.color && (this.color = colors[options.color])
	this.type = (options.type) ? options.type : "count"
}

var items = {}

var render = function(stamp){
	var out = ""
  for (var i in items) {
    var c = items[i]
    var text = c.color ? c.color(c.label) : c.label



    var nums = ""

    var types = c.type
    if( Object.prototype.toString.call( types ) !== '[object Array]' ) {
    	types = [c.type]
		}

		for (var a = 0; a < types.length; a++) {
			if(a > 0)
				nums += pad
	    switch(types[a]) {
	    	case "percentage":
	    		nums += (100 * c.count/c.max).toFixed(3) + " %"
	    		break;
	    	case "bar":
	    		var done = Math.round(10 * c.count/c.max) 
	    		nums += "["
	    		for (var i = 0; i < done; i++) {
	    			nums += "▒".white
	    		}
	    		for (var i = 0; i < 10-done; i++) {
	    			nums += "-".black
	    		}
	    		nums += "]"
	    		break;
	    	default:
	    		nums += c.count
	    		if(c.max)
	    			nums += "/" + c.max
	    		break;
	    }
	  }
    out += "|" + pad + text + ": " + nums + pad
  }
  out +=  " |"
  if(stamp) {
  	process.stdout.write("\u001B[2K")
  	console.log("@ " + nicetime(new Date().getTime() - start) + out + "\r")
  }
  process.stdout.write("\u001B[2KStatus: " + out + "\r")
}

var nicetime = function(ms){
	var seconds = ms / 1000
	var minutes = seconds / 60
	return (minutes < 2) ? seconds + "s " : minutes + " mins "
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