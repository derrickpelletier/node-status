Status!
=======

Makes a little stdout status bar, live update, etc, etc.
Very early/rough stage. Will document soon.

I plan to make a better name for this.


## An example!

	// Initialize the item with options
	status.addItem("pizza", {
	  color: 'green',
	  type: ['bar','percentage'],
	  max: 8,
	  precision: 0
	})
	
	// Increment the item whenever you need it updated
	status.updateItem('pizza', 1)
	
This will output: `Status: |   pizza: [█▒▒▒▒▒▒▒▒▒]   13 %   |`