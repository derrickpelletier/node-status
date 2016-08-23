const colors = require('colors');
const util = require('util');
const tty = require('tty');
const charm = require('charm')(process);
const cliSpinners = require('cli-spinners');
const cliCursor = require('cli-cursor');

const PADDING = '  ';

var iterations = 0;
var looper = null;
var running = false;
var items = {};
var defaultPattern = null;
var settings = {
  invert: false,
  interval: 250,
  pattern: null,
  bottom: false
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
var Item = function (options) {
  const defaults = {
    name: null,
    max: null,
    precision: 2,
    steps: false
  };
  for (var attrname in defaults) {
    this[attrname] = options.hasOwnProperty(attrname) && options[attrname] !== null ? options[attrname] : defaults[attrname];
  }
  if(options.custom) this.custom = options.custom.bind(this);
  this.val = options.count || 0;
};

//
// Item functions for value changes, rendering, etc
//
Item.prototype = {
  inc: function (amount) {
    this.val += (amount !== undefined) ? amount : 1;
  },

  dec: function (amount) {
    this.val -= (amount !== undefined) ? amount : 1;
  },

  doneStep: function (success, message) {
    if(!this.steps || this.count >= this.steps.length) return;
    charm.erase('line').erase('down');
    message = message ? ` - ${message}` : '';
    write(`${success ? '✔'.green : '✖'.red} ${this.render('step')}${message}\n`);
    this.inc();
  },

  render: function (style) {
    switch (style) {
      case 'step':
        if(!this.steps || this.count >= this.steps.length) return '';
        return `${this.steps[this.count]}`;
      case 'custom':
        return this.custom ? this.custom() : '';
      case 'percentage':
        if (!this.max) return '';
        var max = typeof this.max == 'function'
                ? this.max()
                : this.max;
        return (100 * this.count / max).toFixed(this.precision) + '%';
      case 'time':
        return nicetime(this.count);
      case 'bar':
        if (!this.max) return '';
        var bar_len = 10;
        var max = typeof this.max == 'function'
                ? this.max()
                : this.max;
        var done = Math.round(bar_len * this.count / max);
        return '[' + '▒'.repeat(Math.min(bar_len, done)) + '-'.repeat(Math.max(0,bar_len - done)) + ']';
      case 'default':
      case 'count':
      default:
        var max = typeof this.max == 'function'
                ? this.max()
                : this.max;
        return this.count + (max ? '/' + max : '');
    }
  }
};

//
// Getter/setter for count. Auto-rendering, basically.
//
Object.defineProperties(Item.prototype, {
  count: {
    get: function () {
      return this.val;
    },
    set: function (newValue) {
      this.val = newValue;
    }
  }
});


//
// Repeats a string, using it for the status bar instead of loops
//
String.prototype.repeat = function (len) {
  return new Array(len + 1).join(this);
};

//
// Render the status bar row
// If stamp is true, it will console.log it instead of doing an stdout
//
const render = () => {
  iterations++;
  if (!running) return;

  var color_len = 0;
  for (var i = 0; i < items.length; i++) {
    if (items[i].color) {
      color_len += (items[i].color('')).length;
    }
  }

  var out = generateBar();
  var bar = ' '.repeat(tty_size.width);

  if (settings.invert) {
    bar = bar.inverse;
    out = out.inverse;
  }

  var current_height = Math.ceil((out.length - color_len) / tty_size.width );

  charm.position(function (x, y) {
    var current_row = y;

    // If the current cursor row was on the bar, we need to make a gap
    if (settings.bottom && current_row > tty_size.height - current_height) {
      for(var i = 0; i < current_height; i++) {
        // charm.delete('line', 1);
        charm.erase('line');
        write('\n');
      }
      y -= current_height - (tty_size.height - current_row);
    }

    charm
      .move(0, settings.bottom ? tty_size.height : 0)
      .left(tty_size.width)
      .write(bar);

    if(settings.bottom) {
      for(var i = 0; i < Math.max(0, current_height - 1); i++) {
        charm.left(tty_size.width).write(bar).up(1);
      }
    }

    charm
      .left(tty_size.width)
      .write(out)
      .position(x, y);

  });
};

const write = (string) => process.stdout.write(string);

const generateBar = () => {
  var pattern = settings.pattern ? settings.pattern : defaultPattern;
  return pattern.replace(/\{([a-zA-z0-9\s\.]*)\}/g, (match, id) => {
    var tokens = id.split('.');
    var portion = '';
    var color = null;
    var modifier = null;
    if(tokens.length > 1 && colors[tokens[1]]) {
      color = colors[tokens[1]];
      modifier = tokens.length > 2 ? tokens[2] : null;
    } else if (tokens.length > 2 && colors[tokens[2]]) {
      color = colors[tokens[2]];
      modifier = tokens[1];
    } else if(tokens.length > 1) {
      modifier = tokens[1];
    }

    switch (tokens[0]) {
      case 'timestamp':
      case 'uptime':
        portion = nicetime(process.uptime(), true);
        break;
      case 'spinner':
        var spinnerType = modifier || 'dots';
        portion = cliSpinners[spinnerType].frames[iterations % cliSpinners[spinnerType].frames.length];
        break;
      default:
        if(items[tokens[0]]) portion = items[tokens[0]].render(modifier);
        break;
    }
    return color ? color(portion) : portion;
  });
};

//
// Currently just changes the milliseconds to either a number of seconds or number of minutes
//
var nicetime = (ms, use_seconds) => {
  var seconds = (ms / (use_seconds ? 1 : 1000)).toFixed((use_seconds ? 0 : 3));
  var minutes = (seconds / 60).toFixed(3);
  var time = (minutes < 2) ? seconds : minutes;
  return time + (minutes < 2 ?  's' : 'm');
};

process.on('exit', function () {
  if(running) stamp();
});

exports.addItem = (name, options) => {
  if(!name || typeof name !== 'string') return null;
  options = options || {};
  options.name = name;
  var item = new Item(options);
  items[name] = item;
  rebuildPattern();
  return items[name];
};

var rebuildPattern = () => {
  defaultPattern = Object.keys(items).reduce((memo, item) => {
    return `${memo}${PADDING}${item}: {${item}}${PADDING}|`;
  }, `Status @ {uptime}${PADDING}|`);
};

exports.removeItem = (item) => {
  if(typeof item === 'string') {
    delete items[item];
  } else if(item instanceof Item) {
    delete items[item.name];
  }
  rebuildPattern();
}

exports.removeAll = () => {
  items = {};
  rebuildPattern();
}
exports.toString = () => generateBar();
exports.clear = () => charm.erase('line').erase('down');

exports.console = function () {
  var methods = {};
  ['log', 'info', 'error', 'warn'].forEach(m => {
    methods[m] = function () {
      if(m !== 'log' || running) exports.clear();
      console[m].apply(this, arguments);
      if(running) render();
    }
  });
  return methods;
};

//
// Turns it on, will start rendering on interval now
//
exports.start = (opts) => {
  settings = Object.assign(settings, opts)
  running = true;
  if(!settings.bottom) cliCursor.hide();
  render();
  looper = setInterval(render, settings.interval);
};

exports.setPattern = (pattern) => settings.pattern = pattern;

exports.stop = () => {
  running = false;
  clearTimeout(looper);
  cliCursor.show();
  charm.end();
};

//
// Stamps the current status to the console
//
var stamp = exports.stamp = (withPattern) => {
  charm.erase('line').erase('down');
  return console.log(generateBar(withPattern));
}

//
// Gets the total number of cells in the bar
//
exports.cellCount = () => Object.keys(items).length;
