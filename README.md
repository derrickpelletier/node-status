# Status!

Makes a little stdout status bar. Currently something I made to use for tooling in node.
Very early/rough stage, changing often.

```
npm install node-status
```

## An example!
```javascript
// Initialize the item with options

var status = require('node-status')

var pizzas = status.addItem('pizza')

// Start the status-bar
status.start()

// Increment the item whenever you need it updated
pizzas.inc()
pizzas.inc(3)
```


**Example output not representative of above settings:** (More examples in `example.js`)

![image](http://f.cl.ly/items/1O3P0D1g0v1O373u1T1y/animated_status_bar.gif)



## Config
Status accepts the following config options on start():
+ `invert`: defaults to *false*. Inverts the colors of the bar.
+ `interval`: defaults to 250. Number of milliseconds per re-draw interval.
+ `pattern`: optional manual definition for status bar layout. See [Patterns](#patterns)

```javascript
status.start({
	invert: true,
	interval: 200,
	pattern: 'Doing work: {uptime}  |  {spinner.cyan}  |  {pizza.bar}'
})
```

## Item Options

All item options are optional.

| option | type | default | notes ]
|---|---|---|---|
| **count** | `number` | `0` | Can specify a starting count if needed. |
| **max** | `number` | `null` | Will cause 'count' type to display as `count/max`. ***Required*** for some display types. Can be a number or a function that returns a number. |
| **custom** | `function` | `null` | a function run when the pattern `{<item>.custom}` is used. Access `this.count` and `this.max` for values if needed. Must return a `string`. |
| **precision** | `number` | `2` | The precision used in percentages. |

## Patterns

The pattern setting in status config can be used to layout your bar as you see fit, if the default doesn't suit you. Simply a string of tokens.

The pattern:

```
'Doing work: {uptime}  |  {spinner.cyan}  |  {pizza.bar}'
```

Would render as:
```
Doing work: 10s  |  ⠼  |  [▒▒▒▒▒▒----]
```

Tokens are specified as: `{<token>[.color][.modifier]}`.

All tokens support colorization with [marak/colors](https://github.com/Marak/colors.js).

### Non-item tokens

| token | modifiers | notes |
|---|---|---|
| uptime |  | renders the current uptime of the process. |
| spinner | spinner types | renders a spinner. Any type available in [cli-spinners](https://github.com/sindresorhus/cli-spinners) can be used. Ex: `{spinner.bouncingBall.cyan}`

### Item tokens

All items use their `name` as tokens. If you add an item named `pizza`, you can render it in the pattern with `{pizza}`. Simple.

#### Item type modifiers
The items have a number of types available to render.

| type | example | |
|---|---|---|
| default | `5` or `5/10` | With no type specified, item is rendered as the `count`, or the `count/max` if `max` was specified. |
| percentage | 15.23% | Renders a simple percentage, requires `max` to be set. Uses the `precision` setting to round the value. |
| custom | anything | Renders whatever is returned by the specified `custom` function. |
| bar | `[▒▒▒▒▒-----]` | Renders as a progress bar. Requires `max` to be set. |
| time | 15s | Uses the count as milliseconds and renders the value as a nicely formatted time. |


## Using Console.log alongside status
Right now, if you have to use `console.log` after the status bar has started, it can be a bit janky because the stdout line isn't cleared when a console.log is run.

You can utilize an extended console.log by adding this after requiring status.
```javascript
console = status.console()
```
