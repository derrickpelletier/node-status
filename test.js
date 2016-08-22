var chai = require('chai');
var assert = chai.assert,
    expect = chai.expect,
    status = require('./status.js'),
    colors = require('colors');


var regex = {
  start: /^Status @ [0-9]+s  \|/
}

beforeEach(function () {
  status.removeAll()
  status.setPattern(null)
});

describe('Creating an item', function () {

  it('should not create an item when no parameters', function () {
    var item = status.addItem()
    expect(item).to.be.null
    expect(status.cellCount()).to.equal(0)
  })

  it('should instantiate with just a name', function () {
    expect(status.addItem('just a name')).to.be.an.instanceof(status.Item)
  })

  it('should have default properties', function () {
    var item = status.addItem('item2')
    var defaults = {
      max: null,
      precision: 2
    }

    expect(item).to.have.property('name', 'item2')
    expect(item).to.have.property('max', null)
    expect(item).to.have.property('precision', 2)
  })

  it('should set all applicable options', function () {
    var customFn = function () { return 'test' }

    var item = status.addItem('all opts', {
      max: 50,
      precision: 5,
      count: 30,
      custom: customFn
    });
    expect(item).to.have.property('name', 'all opts')
    expect(item).to.have.property('max', 50)
    expect(item).to.have.property('precision', 5)
    expect(item).to.have.property('count', 30)
    expect(item.custom()).to.equal('test')
  })

})


describe('Changing count values', function () {
  it('should change count accordingly', function () {
    var item = status.addItem('changing counts')
    item.inc()
    expect(item.count).to.equal(1)
    item.inc(5)
    expect(item.count).to.equal(6)
    item.dec()
    expect(item.count).to.equal(5)
    item.dec(5)
    expect(item.count).to.equal(0)
    item.count = 20
    expect(item.count).to.equal(20)
  })
})


describe('Rendering single-type cells', function () {

  it('should draw a cell', function () {
    var item = status.addItem('pizza', {
      custom: function () { return 'hot' }
    })
    expect(item.render()).to.equal('0')

    item.inc(5)
    expect(item.render()).to.equal('5')

    expect(item.render('percentage')).to.equal('')

    item.max = 10
    expect(item.render('count')).to.equal('5/10')

    expect(item.render('percentage')).to.equal('50.00%')
    item.precision = 0
    expect(item.render('percentage')).to.equal('50%')

    expect(item.render('time')).to.equal('0.005s')

    expect(item.render('bar')).to.equal('[▒▒▒▒▒-----]')

    expect(item.render('custom')).to.equal('hot')
  })
})





describe('Removing items', function () {

  it('should remove a single item', function () {
    var item = status.addItem('item')
    var item2 = status.addItem('item2')

    expect(status.cellCount()).to.equal(2)
    status.removeItem(item)

    expect(status.cellCount()).to.equal(1)
    status.removeItem('item2')

    expect(status.cellCount()).to.equal(0)
  });

  it('should clear the bar', function () {
    var item = status.addItem('item')
    var item2 = status.addItem('item2')
    expect(status.cellCount()).to.equal(2)
    status.removeAll()
    expect(status.cellCount()).to.equal(0)

  })
})


describe('Rendering a bar', function () {
  it('should return a bar with a cell for the item', function () {

    status.addItem('foo', {
      count: 10
    });

    var bar = status.toString()
    assert.match(bar, regex.start, 'Start matches');
    assert.match(bar, /  foo: 10  \|$/, 'Cell matches');
  })

  describe('Patterns', function () {
    it('should render only the uptime', function () {
      status.setPattern('{uptime}');
      assert.match(status.toString(), /^[0-9]+s$/, 'Uptime only');
    })

    it('should render only a spinner', function () {
      var cliSpinners = require('cli-spinners');
      status.setPattern('{spinner}')
      var bar = status.toString();
      expect(cliSpinners.dots.frames.indexOf(bar)).to.be.greaterThan(-1);
    })

    it('should render all spinner types', function () {
      var cliSpinners = require('cli-spinners');

      Object.keys(cliSpinners).forEach(spinner => {
        status.setPattern(`{spinner.${spinner}}`)
        expect(cliSpinners[spinner].frames.indexOf(status.toString())).to.be.greaterThan(-1);
      })
    })
  })
  describe('Rendering multi-type cells', function () {

    it('should draw a bar with multiple types for a defined pattern', function () {

      var item = status.addItem('pizza', {
        count: 42,
        max: 100
      })

      var item = status.addItem('hot dogs', {
        count: 14
      })

      status.setPattern('{pizza}|{pizza.bar}|{pizza.percentage}|{hot dogs}')
      assert.match(status.toString(), /^42\/100\|\[[▒]{4}[-]{6}]\|42.00%\|14$/, 'Cells match');
    })
  })
})

describe('Modifying the Array prototype does not break generateBar', function () {
  it('should return a proper bar string', function () {
    Array.prototype.remove = function(e) {
      var t, _ref;
      if ((t = this.indexOf(e)) > -1) {
        return ([].splice.apply(this, [t, t - t + 1].concat(_ref = [])), _ref)
      }
    }

    status.addItem('foo', {
      count: 40
    })
    status.setPattern(null);
    expect(status.toString()).to.be.a('string');
    assert.match(status.toString(), regex.start, 'Start matches');
    assert.match(status.toString(), /  foo: 40  \|$/, 'Cell matches');
  })
})
