var colors = require('colors'),
		start_time = new Date().getTime(),
		pad = "   ",
		items = [],
		util = require('util'),
		tty = require('tty'),
		running = false


var isatty = tty.isatty(1) && tty.isatty(2);
var window = {
  width: isatty
    ? process.stdout.getWindowSize
      ? process.stdout.getWindowSize(1)[0]
      : tty.getWindowSize()[1]
    : 75
}
cursor = {
  hide: function(){
    process.stdout.write('\u001b[?25l');
  },

  show: function(){
    process.stdout.write('\u001b[?25h');
  },

  deleteLine: function(){
    process.stdout.write('\u001b[2K');
  },

  beginningOfLine: function(){
    process.stdout.write('\u001b[0G');
  },

  CR: function(){
    cursor.deleteLine();
    cursor.beginningOfLine();
  }
}

var cursorUp = function(n) {
  write('\u001b[' + n + 'A');
}
var cursorDown = function(n) {
  write('\u001b[' + n + 'B');
}

exports.start_time = start_time

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
	},

	toString: function(){
  	var nums = (this.color ? this.color(this.name) : this.name) + ": ",
				types = this.type

    if( Object.prototype.toString.call( types ) !== '[object Array]' ) 
    	types = [this.type]

		for (var a = 0; a < types.length; a++) {
			if(a > 0)
				nums += pad
			if("function" === typeof types[a]) {
				nums += types[a](this)
			} else {
		    switch(types[a]) {
		    	case "percentage":
		    		if(!this.max) break
		    		nums += (100 * this.count/this.max).toFixed(this.precision) + " %"
		    		break
		    	case "runtime":
		    		nums += nicetime(process.uptime(), true) + " "
		    		break
		    	case "time":
		    		nums += nicetime(this.count) + " "
		    		break
		    	case "bar":
		    		if(!this.max) break
		    		var bar_len = 10
		    		var done = Math.round(bar_len * this.count/this.max) 
		    		nums += "[" + "▒".repeat(Math.min(bar_len, done)) + "-".repeat(Math.max(0,bar_len - done)) + "]"
		    		break
		    	default:
		    		nums += this.count + (this.max ? "/" + this.max : "")
		    		nums += this.suffix
		    		break
		    }
		  }
	  }
	  return nums
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

  if(stamp) {
  	console.log(out + "\r")
  } else {

		
		cursorUp(2)
		cursor.deleteLine()
		cursor.beginningOfLine()


		write("+"+"-".repeat(out.length - (items.length * 10)) + "+")
		cursorDown(1)
		cursor.deleteLine()
		cursor.beginningOfLine()
		write("| ")

	  write(out)

		cursorDown(1)
		cursor.deleteLine()
		cursor.beginningOfLine()
		write("+"+"-".repeat(out.length - (items.length * 10)) + "+")
	}
}

function write(string) {
  process.stdout.write(string);
}


var generateBar = function(){
	var out = ""
  for (var i in items) {
    out += pad + items[i].toString() + pad + "|"
  }
  if(out !== "")
  	out = "Status @ " + nicetime(process.uptime(), true) + " |" + out
  return out
}

//
// Currently just changes the milliseconds to either a number of seconds or number of minutes
//
var nicetime = function(ms, use_seconds){
	var seconds = (ms / (use_seconds ? 1 : 1000)).toFixed((use_seconds ? 0 : 3))
	var minutes = (seconds / 60).toFixed(3)
	var time = (minutes < 2) ? seconds : minutes
	return time + (minutes < 2 ?  "s" : "m")
}
exports.nicetime = nicetime

process.on('exit', function() {
	cursor.show()
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
// Removes the item from the bar
//
exports.removeItem = function(item) {
	var to_remove = items.indexOf(item)
	if(to_remove < 0)
		throw new Error('This cell is not in the bar')
	items.splice(to_remove)
}
exports.removeAll = function() {
	items = []
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
	cursor.hide()
	write("\n".repeat(2))
	running = true
	render()
}

//
// Stamps the current status to the console
//
exports.stamp = function() {
	render(true)
}

//
// Gets the total number of cells in the bar
//
exports.cellCount = function() {
	return items.length
}


