const ObservableObject = require('../../../../attrocity.js').Observables.Object;
const test = require('tape');

const jsdom = require('jsdom');
const { JSDOM } = jsdom;


const dom = new JSDOM(`<div class="someclass" test="hi"></div>`);
const el = dom.window.document.querySelector('div');
global.Element = el.constructor;

test('observe deep object', function (t) {
    t.plan(2);

    const model = { deep:
        {   property1: 'test1',
            property2: 'test2',
            property3: 'test3',
            property4: 'test4' }
    };

    const observableModel = new ObservableObject(model, function(name, value) {
        t.equal(name, 'property1');
        t.equal(value, 'hello1');
    });

    observableModel.data.deep.property1 = 'hello1';
});

test('get key path in callback', function (t) {
    t.plan(2);

    const model = { a: {
            deep:
                {
                    property1: 'test1',
                    property2: 'test2',
                    property3: 'test3',
                    property4: 'test4'
                }
        }
    };

    const observableModel = new ObservableObject(model, function(name, value, details) {
        t.equal(details.keyPath, 'a.deep.property1');
        t.equal(name, 'property1');
    });

    observableModel.data.a.deep.property1 = 'hello1';
});

test('get super deep key path in callback', function (t) {
    t.plan(2);

    const model = { a: { b: { c: { d: { e: {
            deep:
                {
                    property1: 'test1',
                    property2: 'test2',
                    property3: 'test3',
                    property4: 'test4'
                }
        }}}}}
    };

    const observableModel = new ObservableObject(model, function(name, value, details) {
        t.equal(details.keyPath, 'a.b.c.d.e.deep.property1');
        t.equal(name, 'property1');
    });

    observableModel.data.a.b.c.d.e.deep.property1 = 'hello1';
});

test('observe deep object changing value to same thing', function (t) {
    t.plan(1);

    const model = { deep: {
            property1: 'test1',
            property2: 'test2',
            property3: 'test3',
            property4: 'test4'
        }
    };

    const observableModel = new ObservableObject(model, function(name, value) {
        t.fail();
    });

    observableModel.data.deep.property1 = 'test1';
    observableModel.data.deep.property2 = 'test2';
    observableModel.data.deep.property3 = 'test3';
    observableModel.data.deep.property4 = 'test4';

    setTimeout( function() {
        t.pass();
        observableModel.stop();
    }, 50);
});


test('observe deep property that was not present at start', function (t) {
    t.plan(2);

    const model = {
        deep: {
            property1: 'test1',
            property2: 'test2',
            property3: 'test3',
            property4: 'test4'
        }
    };

    const observableModel = new ObservableObject(model, function(name, value) {
        t.equal(name, 'property5');
        t.equal(value, 'hello');
    });

    observableModel.data.deep.property5 = 'hello';
});

test('change deep property in watchlist', function (t) {
    t.plan(2);

    const model = {
        deep: {
            property1: 'test1',
            property2: 'test2',
            property3: 'test3',
            property4: 'test4'
        }
    };

    const observableModel = new ObservableObject(model, function(name, value) {
        t.equal(name, 'property5');
        t.equal(value, 'hello');
    }, ['property5']);

    observableModel.data.deep.property5 = 'hello';
});

test('allow change for deep watched property', function (t) {
    t.plan(1);

    const model = {
        deep: {
            property1: 'test1',
            property2: 'test2',
            property3: 'test3',
            property4: 'test4'
        }
    };

    const observableModel = new ObservableObject(model, null, { watchKeys: ['property4'] });

    observableModel.data.deep.property4 = 'hello';
    t.equal(observableModel.data.deep.property4, 'hello');
});


test('disallow getting non-watched deep property', function (t) {
    t.plan(1);

    const model = {
        deep: {
            property1: 'test1',
            property2: 'test2',
            property3: 'test3',
            property4: 'test4'
        }
    };

    const observableModel = new ObservableObject(model, null, { watchKeys: ['property5'] });
    t.equal(observableModel.data.property4, undefined);
});

test('change deep property that was not present at start', function (t) {
    t.plan(1);

    const model = {
        deep: {
            property1: 'test1',
            property2: 'test2',
            property3: 'test3',
            property4: 'test4'
        }
    };

    const observableModel = new ObservableObject(model, null);

    observableModel.data.deep.property6 = 'hello';
    t.equal(observableModel.data.deep.property6, 'hello');
});

test('disallow deep property change that was not present at start', function (t) {
    t.plan(1);

    const model = {
        deep: {
            property1: 'test1',
            property2: 'test2',
            property3: 'test3',
            property4: 'test4'
        }
    };

    const observableModel = new ObservableObject(model, null, { watchCurrentKeysOnly: true });

    observableModel.data.deep.property6 = 'hello';
    t.equal(observableModel.data.deep.property6, undefined);
});


test('observe deep array', function (t) {
    t.plan(2);

    const model = { deep: [0,1,2,3,4,5] };

    const observableModel = new ObservableObject(model, function(name, value) {
        t.equal(name, '1');
        t.equal(value, 3);
    });

    observableModel.data.deep[1] = 3;
});
