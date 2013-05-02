var colors = require('colors'),
		start = new Date().getTime(),
		pad = "   ",
		items = {},
		util = require('util'),
		running = false

//
// This is a single item (Or cell or whatever you call it) in the status display
//
var Item = function(options) {
	this.name = options.name
	this.label = (options.label) ? options.label : options.name
	this.count = 0
	options.count && (this.count = options.count)
	options.max && (this.max = options.max)
	options.color && (this.color = colors[options.color])
	this.type = (options.type) ? options.type : "count"
	this.precision = (options.precision != undefined) ? options.precision : 2
}

//
// Repeats a string, using it for the status bar instead of loops
//
String.prototype.repeat = function( len ) {return new Array(len + 1).join(this)}

//
// Render the status bar row
// Loops through all items, then loops through the different types for each item
// If stamp is true, it will console.log it instead of doing an stdout
//
var render = function(stamp){
	if(!running) return
	var out = ""
  for (var i in items) {

    var c = items[i],
  		nums = (c.color ? c.color(c.label) : c.label) + ": ",
  		types = c.type

    if( Object.prototype.toString.call( types ) !== '[object Array]' ) 
    	types = [c.type]

		for (var a = 0; a < types.length; a++) {
			if(a > 0)
				nums += pad
	    switch(types[a]) {
	    	case "percentage":
	    		if(!c.max) break;
	    		nums += (100 * c.count/c.max).toFixed(c.precision) + " %"
	    		break;
	    	case "time":
	    		nums += nicetime(new Date().getTime() - start)
	    		break;
	    	case "bar":
	    		if(!c.max) break;
	    		var bar_len = 10
	    		var done = Math.round(bar_len * c.count/c.max) 
	    		nums += "[" + ("▒").repeat(done) + ("-").repeat(bar_len - done) + "]"
	    		break;
	    	default:
	    		nums += c.count + (c.max ? "/" + c.max : "")
	    		break;
	    }
	  }
    out += pad + nums + pad + "|"
  }
  if(out === "") return
  if(stamp) {
  	process.stdout.write("\u001B[2K")
  	console.log("Status @ " + nicetime(new Date().getTime() - start) + "|" + out + "\r")
  } else {
  	process.stdout.write("\u001B[2K  Status: |" +  out + "\r")
  }
}

//
// Currently just changes the milliseconds to either a number of seconds or number of minutes
//
var nicetime = function(ms,round){
	var seconds = (ms / 1000).toFixed(3)
	var minutes = (seconds / 60).toFixed(3)
	var time = (minutes < 2) ? seconds : minutes
	if(round) time = Math.round(time)
	return time + (minutes < 2 ?  "s " : "m ")
}

process.on('exit', function() {
  render(true)
});

//
// add a new item to the status bar
//
exports.addItem = function(name, options){
	options.name = name
	items[name] = new Item(options)
}

//
// Update the count on an item, then re-render
//
exports.updateCount = function(item, amount) {
	item = items[item]
	item.count += (amount != undefined) ? amount : 1
	if(item.max != undefined) item.count = Math.min(item.count, item.max)
	render()
}

exports.setCount = function(item, amount) {
	item = items[item]
	item.count = amount
	render()
}

//
// Return the count for the item, or 0 if it doesn't exist...
//
exports.getCount = function(item) {
	return !items[item] ? 0 : items[item].count
}

//
// Update the maximum value for the item.
//
exports.updateMax = function(item, amount) {
	item = items[item]
	item.max = amount
}

var clear_line = function(){ process.stdout.write("\u001B[2K") }

var log = function() {
	clear_line()
	console.log.apply(this,arguments)
	render()
}
var info = function() {
	clear_line()
	console.info.apply(this,arguments)
	render()
}
var warn = function() {
	clear_line()
	console.warn.apply(this,arguments)
	render()
}
var error = function() {
	clear_line()
	console.error.apply(this,arguments)
	render()
}
exports.clear = "\u001B[2K"

exports.console = function(){
	return {
		'log':log,
		'info':info,
		'error':error,
		'warn':warn
	}
}

var auto_stamp = false
exports.startAutoStamp = function(rate){
	running = true
	if(!rate) rate = 10000
	exports.killAutoStamp()
	auto_stamp = setInterval(exports.stamp, rate)
}

exports.killAutoStamp = function(){
	if(auto_stamp) {
		clearInterval(auto_stamp)
	}
}

exports.start = function(){
	running = true
}

//
// Stamps the current status to the console
//
exports.stamp = function() {
	render(true)
}