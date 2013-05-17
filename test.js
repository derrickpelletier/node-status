var assert = require('assert'),
    status = require('./status.js'),
    colors = require('colors')






describe('Creating an item', function(){

  it('should throw Error when no parameters', function(){
    assert.throws(function(){
      status.addItem()
    })
  })

  it('should instantiate with just a name', function(){
    assert.throws(function(){
      throw status.addItem("just a name")
    }, status.Item )
  })

  it('should have default properties', function(){
    var item = status.addItem({})
    var defaults = {
      name: 'un-named',
      max: null,
      color: null,
      type: 'count',
      suffix: '',
      precision: 2
    }
    for(var i in defaults) {
      assert.equal(item[i], defaults[i])
    }
  })

  it('should set all applicable options', function(){
    var test_item = status.addItem({
      name: 'all opts',
      max: 50,
      color: 'red',
      type: 'bar',
      suffix: 'seconds',
      precision: 5
    })
    assert.equal(test_item.name, 'all opts')
    assert.equal(test_item.max, 50)
    assert.equal(test_item.color, colors['red'])
    assert.equal(test_item.type, 'bar')
    assert.equal(test_item.suffix, 'seconds')
    assert.equal(test_item.precision, 5)
  })

})


describe('Changing count values', function(){
  it('should change count accordingly', function(){
    var item = status.addItem({})
    item.inc()
    assert.equal(item.count, 1)
    item.inc(5)
    assert.equal(item.count, 6)
    item.dec()
    assert.equal(item.count, 5)
    item.dec(5)
    assert.equal(item.count, 0)
    item.count = 20
    assert.equal(item.count, 20)
  })
})


describe('Rendering single-type cells', function(){

  it('should draw a cell', function(){
    var item = status.addItem("pizza")
    assert.equal(item.toString(), "pizza: 0")

    item.inc(5)
    assert.equal(item.toString(), "pizza: 5")
    
    item.type = "percentage"
    assert.equal(item.toString(), "pizza: ")

    item.type = "count"
    item.max = 10
    assert.equal(item.toString(), "pizza: 5/10")

    item.type = "percentage"
    assert.equal(item.toString(), "pizza: 50.00 %")
    item.precision = 0
    assert.equal(item.toString(), "pizza: 50 %")

    item.type = "runtime"
    var runtime = ((new Date().getTime() - status.start_time)/1000).toFixed(3)
    assert.equal(item.toString(), "pizza: " + runtime + "s ")

    item.type = "time"
    assert.equal(item.toString(), "pizza: 0.005s ")

    item.type = "bar"
    assert.equal(item.toString(), "pizza: [▒▒▒▒▒-----]")


  })
})


describe('Rendering multi-type cells', function(){

  it('should draw a cell bar with multiple types', function(){
    
    var item = status.addItem({
      name: "pizza",
      count: 42,
      max: 100,
      type: ['count', 'bar', 'percentage']
    })

    assert.equal(item.toString(), "pizza: 42/100   [▒▒▒▒------]   42.00 %")

  })
})


describe('Removing items', function(){
  it('should clear the bar', function(){

    var magic = status.addItem('magic')
    assert.equal(status.cellCount(), 7)
    status.removeItem(magic)
    assert.equal(status.cellCount(), 6)
    assert.throws(function(){
        status.removeItem(magic)
      }, Error)

    status.removeAll()
    assert.equal(status.cellCount(), 0)

  })
})


describe('Rendering a bar', function(){
  it('should appear correctly', function(){

    status.addItem({
      name:'foo',
      count: 10
    })
    status.addItem({
      name:'bar',
      count: 5,
      max: 20
    })

    var runtime = ((new Date().getTime() - status.start_time)/1000).toFixed(3)
    assert.equal(status.toString(), "Status @ " + runtime + "s |   foo: 10   |   bar: 5/20   |")

  })
})