var colors = require('colors'),
  pad = "  ",
  items = [],
  util = require('util'),
  tty = require('tty'),
  charm = require('charm')(process),
  running = false,
  drawn = false,
  auto_stamp = false,
  looper = null,
  settings = {
    invert: true,
    interval: 250
  };

var isatty = tty.isatty(1) && tty.isatty(2);
var tty_size = {
  width: isatty
    ? process.stdout.getWindowSize
      ? process.stdout.getWindowSize(1)[0]
      : tty.getWindowSize()[1]
    : 75,
  height: isatty
    ? process.stdout.getWindowSize
      ? process.stdout.getWindowSize(1)[1]
      : tty.getWindowSize()[2]
    : 75
};


//
// This is a single item (Or cell or whatever you call it) in the status display
//
var Item = exports.Item = function(options) {
  var defaults = {
    name: 'un-named',
    max: null,
    color: null,
    type: 'count',
    suffix: '',
    precision: 2,
    text: ''
  };
  options = options || {};
  options.color && (options.color = colors[options.color]);
  for (var attrname in defaults) {
    this[attrname] = options.hasOwnProperty(attrname) && options[attrname] !== null ? options[attrname] : defaults[attrname];
  }
  this.val = options.count || 0;
};

//
// Item functions for value changes, rendering, etc
//
Item.prototype = {
  inc: function(amount){
    this.val += (amount !== undefined) ? amount : 1;
  },

  dec: function(amount){
    this.val -= (amount !== undefined) ? amount : 1;
  },

  toString: function() {
    var nums = " " + this.name + ": ",
      types = this.type;

    if (Object.prototype.toString.call( types ) !== '[object Array]') {
      types = [this.type];
    }

    for (var a = 0; a < types.length; a++) {
      if (a > 0) {
        nums += pad;
      }
      if ("function" === typeof types[a]) {
        nums += types[a](this);
      } else {
        switch (types[a]) {
          case "percentage":
            if (!this.max) {
              break;
            }
            nums += (100 * this.count/this.max).toFixed(this.precision) + " %";
            break;
          case "runtime":
            nums += nicetime(process.uptime(), true) + " ";
            break;
          case "text":
            nums += this.text;
            break;
          case "time":
            nums += nicetime(this.count) + " ";
            break;
          case "bar":
            if (!this.max) {
              break;
            }
            var bar_len = 10;
            var done = Math.round(bar_len * this.count/this.max);
            nums += "[" + "▒".repeat(Math.min(bar_len, done)) + "-".repeat(Math.max(0,bar_len - done)) + "]";
            break;
          default:
            nums += this.count + (this.max ? "/" + this.max : "");
            nums += this.suffix;
            break;
        }
      }
    }
    nums += " ";
    if (this.color) {
      nums = this.color(nums);
    }
    return nums;
  }
};


//
// Getter/setter for count. Auto-rendering, basically.
//
Object.defineProperties(Item.prototype, {
  'count': {
    get: function() {
      return this.val;
    },
    set: function(newValue) {
      this.val = newValue;
    }
  }
});


//
// Repeats a string, using it for the status bar instead of loops
//
String.prototype.repeat = function(len) {
  return new Array(len + 1).join(this);
};

//
// Render the status bar row
// Loops through all items, then loops through the different types for each item
// If stamp is true, it will console.log it instead of doing an stdout
//
var render = function(stamp){

  if (stamp) {
    charm.erase('line').erase('down');
    console.log(generateBar());
  } else if(running) {
    var color_len = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i].color) {
        color_len += (items[i].color("")).length;
      }
    }
    
    var out = " " + generateBar();
    var bar = " ".repeat(tty_size.width);
    
    if (settings.invert) {
      bar = bar.inverse;
      out = out.inverse;
    }

    var current_height = Math.ceil((out.length - color_len) / tty_size.width );

    charm.position(function(x, y) {
      var current_row = y;

      // If the current cursor row was on the bar, we need to make a gap
      if (current_row > tty_size.height - current_height) {
        for(var i = 0; i < current_height; i++) {
          // charm.delete('line', 1);
          charm.erase('line');
          write("\n");
        }
        y -= current_height - (tty_size.height - current_row);
      }

      charm.move(0, tty_size.height).write(bar);
      for(var i = 0; i < Math.max(0, current_height - 1); i++) {
        charm.left(tty_size.width).write(bar).up(1);
      }
      
      charm
        .left(tty_size.width)
        .write(out)
        .position(x, y);

    });

  }
};

function write(string) {
  process.stdout.write(string);
}


var generateBar = function() {
  var out = "";
  for (var i in items) {
    if (items.hasOwnProperty(i)) {
      out += pad + items[i].toString() + pad + "┊";
    }
  }
  if (out !== "") {
    out = "Status @ " + nicetime(process.uptime(), true) + " |" + out;
  }
  return out;
};

//
// Currently just changes the milliseconds to either a number of seconds or number of minutes
//
var nicetime = function(ms, use_seconds){
  var seconds = (ms / (use_seconds ? 1 : 1000)).toFixed((use_seconds ? 0 : 3));
  var minutes = (seconds / 60).toFixed(3);
  var time = (minutes < 2) ? seconds : minutes;
  return time + (minutes < 2 ?  "s" : "m");
};
exports.nicetime = nicetime;

process.on('exit', function() {
  if(running) render(true);
});

//
// add a new item to the status bar
//
exports.addItem = function(name, options) {
  if(!name && !options) {
    throw new Error("You must specify some options to create an item.");
  }

  if (name && typeof name === "object") {
    // Only gave an object of options.
    options = name;
  } else if(typeof name === "string" || (options && typeof options === "object")) {
    // Gave just a name and/or some options
    options = options || {};
    options.name = options.name ? options.name : ((typeof name === "string") ? name : null);
  } else {
    throw new Error("Was unable to parse the arguments?");
  }

  var i = new Item(options);
  items.push(i);
  return i;
};

//
// Removes the item from the bar
//
exports.removeItem = function(item) {
  var to_remove = items.indexOf(item);
  if (to_remove < 0) {
    throw new Error('This cell is not in the bar');
  }
  items.splice(to_remove);
};

exports.removeAll = function() {
  items = [];
};

//
// Return the status bar as a string, useful if needing to log or something.
//
exports.toString = function() {
  return generateBar();
};

var log = function() {
  if (running) {
    exports.clear();
  }
  console.log.apply(this, arguments);
  if (running) {
    render();
  }
};
var info = function() {
  exports.clear();
  console.info.apply(this, arguments);
  if (running) {
    render();
  }
};
var warn = function() {
  exports.clear();
  console.warn.apply(this, arguments);
  if (running) {
    render();
  }
};
var error = function() {
  exports.clear();
  console.error.apply(this, arguments);
  if (running) {
    render();
  }
};

exports.clear = function(){
  charm.erase('line').erase('down');
};

exports.console = function(){
  return {
    'log':log,
    'info':info,
    'error':error,
    'warn':warn
  };
};

//
// Turns it on, will start rendering on inc/dec now
//
exports.start = function(opts) {
  if(opts) {
    opts.hasOwnProperty('invert') && (settings.invert = opts.invert);
    opts.hasOwnProperty('interval') && (settings.interval = opts.interval);
  }
  running = true;
  render();
  looper = setInterval(render, settings.interval);
};

exports.stop = function() {
  running = false;
  clearTimeout(looper);
  render(true);
  charm.end();
};

//
// Stamps the current status to the console
//
exports.stamp = function() {
  render(true);
};

//
// Gets the total number of cells in the bar
//
exports.cellCount = function() {
  return items.length;
};


