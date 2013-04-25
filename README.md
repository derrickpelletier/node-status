Status!
=======

Makes a little stdout status bar, live update, etc, etc.
Very early/rough stage. Will document soon.

I plan to make a better name for this.

## An example!

	// Initialize the item with options
	status.addItem("pizza", {
	  type: ['bar','percentage'],
	  max: 8,
	})
	
	// Increment the item whenever you need it updated
	status.updateCount('pizza')
	
This will output: `Status: |   pizza: [█▒▒▒▒▒▒▒▒▒]   13 %   |`

Also supports more options: `color, precision, count, label`.
Types available right now are: `count (default), bar, percentage, time`.


Note!
===========

If you have to use `console.log` after the status bar has started, it can be a bit janky because the stdout line isn't cleared when a console.log is run.

You can utilize an extended console.log by adding this to the top of the file:

	console = status.console()

or, by just logging this prior to whatever else you need to log:
	
	console.log(status.clear)