var colors = require('colors'),
		start = new Date().getTime(),
		pad = "   ",
		items = [],
		util = require('util'),
		running = false

//
// This is a single item (Or cell or whatever you call it) in the status display
//
var Item = function(options) {
	var defaults = {
		name: 'un-named',
		max: null,
		color: null,
		type: 'count',
		suffix: '',
		precision: 2
	}
	options = options || {}
	options.color && (options.color = colors[options.color])
  for (var attrname in defaults) { 
  	this[attrname] = options.hasOwnProperty(attrname) && options[attrname] != null ? options[attrname] : defaults[attrname]
  }
  this.val = options.count || 0
}

Item.prototype = {
	inc : function(amount){
		this.val += (amount != undefined) ? amount : 1
		render()
	},
	dec : function(amount){
		this.val -= (amount != undefined) ? amount : 1
		render()
	}
}
Object.defineProperties(Item.prototype, {
	'count': {
		get : function(){ return this.val },
		set : function(newValue){ this.val = newValue; render() }
	}
});


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
	var out = generateBar()
  if(out === "") return
  if(stamp) {
  	process.stdout.write("\u001B[2K")
  	console.log(out + "\r")
  } else {
  	process.stdout.write("\u001B[2K  "+ out + "\r")
  }
}

var generateBar = function(){
	var out = ""
  for (var i in items) {

    var c = items[i],
  		nums = (c.color ? c.color(c.name) : c.name) + ": ",
  		types = c.type

    if( Object.prototype.toString.call( types ) !== '[object Array]' ) 
    	types = [c.type]

		for (var a = 0; a < types.length; a++) {
			if(a > 0)
				nums += pad
			if("function" === typeof types[a]) {
				nums += types[a](c)
			} else {
		    switch(types[a]) {
		    	case "percentage":
		    		if(!c.max) break
		    		nums += (100 * c.count/c.max).toFixed(c.precision) + " %"
		    		break
		    	case "runtime":
		    		nums += nicetime(new Date().getTime() - start)
		    		break
		    	case "time":
		    		nums += nicetime(c.count)
		    		break
		    	case "bar":
		    		if(!c.max) break
		    		var bar_len = 10
		    		var done = Math.round(bar_len * c.count/c.max) 
		    		nums += "[" + "▒".repeat(Math.min(bar_len, done)) + "-".repeat(Math.max(0,bar_len - done)) + "]"
		    		break
		    	default:
		    		nums += c.count + (c.max ? "/" + c.max : "")
		    		nums += c.suffix
		    		break
		    }
		  }
	  }
    out += pad + nums + pad + "|"
  }
  if(out !== "")
  	out = "Status @ " + nicetime(new Date().getTime() - start) + "|" + out
  return out
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
})

//
// add a new item to the status bar
//
exports.addItem = function(name, options){
	if(!name && !options) throw new Error("You must specify some options to create an item.")

	if( name && typeof name === "object") { // Only gave an object of options.
		options = name
	} else if(typeof name === "string" || (options && typeof options === "object")) { // Gave just a name and/or some options
		options = options || {}
		options.name = options.name ? options.name : ((typeof name === "string") ? name : null)
	} else {
		throw new Error("Was unable to parse the arguments?")
	}

	var i = new Item(options)
	items.push(i)
	return i
}

//
// Return the status bar as a string, useful if needing to log or something.
//
exports.toString = function() {
	return generateBar()
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

//
// Turns it on, will start rendering on inc/dec now
//
exports.start = function(){
	running = true
	render()
}

//
// Stamps the current status to the console
//
exports.stamp = function() {
	render(true)
}