var assert = require('assert'),
    chai = require('chai'),
    expect = chai.expect,
    status = require('./status.js'),
    colors = require('colors');

beforeEach(function(){
    status.removeAll();
});

describe('Creating an item', function(){

  it('should throw Error when no parameters', function(){
    expect(function(){
      status.addItem()
    }).to.throw(Error)
  })

  it('should instantiate with just a name', function(){
    expect(status.addItem("just a name")).to.be.an.instanceof(status.Item)
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

    expect(item).to.have.property('name', 'un-named')
    expect(item).to.have.property('max', null)
    expect(item).to.have.property('color', null)
    expect(item).to.have.property('type', 'count')
    expect(item).to.have.property('suffix', '')
    expect(item).to.have.property('precision', 2)
  })

  it('should set all applicable options', function(){
    var item = status.addItem({
      name: 'all opts',
      max: 50,
      color: 'red',
      type: 'bar',
      suffix: 'seconds',
      precision: 5
    })
    expect(item).to.have.property('name', 'all opts')
    expect(item).to.have.property('max', 50)
    expect(item).to.have.property('color', colors['red'])
    expect(item).to.have.property('type', 'bar')
    expect(item).to.have.property('suffix', 'seconds')
    expect(item).to.have.property('precision', 5)
  })

})


describe('Changing count values', function(){
  it('should change count accordingly', function(){
    var item = status.addItem({})
    item.inc()
    expect(item.count).to.equal(1)
    item.inc(5)
    expect(item.count).to.equal(6)
    item.dec()
    expect(item.count).to.equal(5)
    item.dec(5)
    expect(item.count).to.equal(0)
    item.update(20)
    expect(item.count).to.equal(20)
  })
})


describe('Rendering single-type cells', function(){

  it('should draw a cell', function(){
    var item = status.addItem("pizza")
    expect(item.toString()).to.equal(" pizza: 0 ")

    item.inc(5)
    expect(item.toString()).to.equal(" pizza: 5 ")

    item.type = "percentage"
    expect(item.toString()).to.equal(" pizza:  ")

    item.type = "count"
    item.max = 10
    expect(item.toString()).to.equal(" pizza: 5/10 ")

    item.type = "percentage"
    expect(item.toString()).to.equal(" pizza: 50.00 % ")
    item.precision = 0
    expect(item.toString()).to.equal(" pizza: 50 % ")

    item.type = "runtime"
    expect(item.toString()).to.equal(" pizza: " + process.uptime() + "s  ")

    item.type = "time"
    expect(item.toString()).to.equal(" pizza: 0.005s  ")

    item.type = "bar"
    expect(item.toString()).to.equal(" pizza: [▒▒▒▒▒-----] ")

    item.type = "text"
    item.text = "hot"
    expect(item.toString()).to.equal(" pizza: hot ")

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

    expect(item.toString()).to.equal(" pizza: 42/100  [▒▒▒▒------]  42.00 % ")

  })
})


describe('Removing items', function(){
  it('should clear the bar', function(){
    var item = status.addItem('item')
    expect(status.cellCount()).to.equal(1)
    status.removeItem(item)
    expect(status.cellCount()).to.equal(0)
    expect(function(){
        status.removeItem(item)
      }).to.throw(Error)

    status.removeAll()
    expect(status.cellCount()).to.equal(0)

  })
})


// Testing the formatting is useless here... see if it returns a string, I guess?
describe('Rendering a bar', function(){
  it('should return a string', function(){

    status.addItem({
      name:'foo',
      count: 10
    })

    expect(status.toString()).to.be.a("string")

  })
})

describe('Modifying the Array prototype does not break generateBar', function(){
    it('should return a short string', function(){
        Array.prototype.remove = function(e) {
            var t, _ref;
            if ((t = this.indexOf(e)) > -1) {
                return ([].splice.apply(this, [t, t - t + 1].concat(_ref = [])), _ref);
            }
        };

        status.addItem({
            name:'foo',
            count: 10
        });

        expect(status.toString()).to.be.a("string");
        expect(status.toString()).to.have.length.below(32);

    })
})
