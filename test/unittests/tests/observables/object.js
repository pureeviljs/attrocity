const ObservableObject = require('../../../../attrocity.js').Observables.Object;
const test = require('tape');

const jsdom = require('jsdom');
const { JSDOM } = jsdom;


const dom = new JSDOM(`<div class="someclass" test="hi"></div>`);
const el = dom.window.document.querySelector('div');
global.Element = el.constructor;

test('observe object', function (t) {
    t.plan(3);

    const model = {
        property1: 'test1',
        property2: 'test2',
        property3: 'test3',
        property4: 'test4',
    };

    const observableModel = new ObservableObject(model, function(name, value, details) {
        t.equal(name, 'property1');
        t.equal(value, 'hello1');
        t.equal(details.keyPath, name);
    });

    observableModel.data.property1 = 'hello1';
});

test('observe object changing value to same thing', function (t) {
    t.plan(1);

    const model = {
        property1: 'test1',
        property2: 'test2',
        property3: 'test3',
        property4: 'test4',
    };

    const observableModel = new ObservableObject(model, function(name, value) {
        t.fail();
    });

    observableModel.data.property1 = 'test1';
    observableModel.data.property2 = 'test2';
    observableModel.data.property3 = 'test3';
    observableModel.data.property4 = 'test4';

    setTimeout( function() {
        t.pass();
        observableModel.stop();
    }, 50);
});


test('remove callback', function (t) {
    t.plan(1);

    const model = {
        property1: 'test1',
        property2: 'test2',
        property3: 'test3',
        property4: 'test4',
    };

    const observableModel = new ObservableObject(model, function(name, value) {
        t.fail('Callback was removed, so this should not be called');
    });

    observableModel.removeCallback();
    observableModel.data.property1 = 'hello1';
    observableModel.addCallback(function(name, value) {
        t.pass();
    });
    observableModel.data.property2 = 'hello1';
});

test('stop observing', function (t) {
    t.plan(1);

    const model = {
        property1: 'test1',
        property2: 'test2',
        property3: 'test3',
        property4: 'test4',
    };

    const observableModel = new ObservableObject(model, function(name, value) {
        t.fail('Callback was stopped, so this should not be called');
    });

    observableModel.stop();
    observableModel.data.property1 = 'hello1';
    setTimeout( function() {
        t.pass();
    }, 10);
});


test('observe property that was not present at start', function (t) {
    t.plan(2);

    const model = {
        property1: 'test1',
        property2: 'test2',
        property3: 'test3',
        property4: 'test4',
    };

    const observableModel = new ObservableObject(model, function(name, value) {
        t.equal(name, 'property5');
        t.equal(value, 'hello');
    });

    observableModel.data.property5 = 'hello';
});

test('change property in watchlist', function (t) {
    t.plan(2);

    const model = {
        property1: 'test1',
        property2: 'test2',
        property3: 'test3',
        property4: 'test4',
    };

    const observableModel = new ObservableObject(model, function(name, value) {
        t.equal(name, 'property5');
        t.equal(value, 'hello');
    }, ['property5']);

    observableModel.data.property5 = 'hello';
});

test('allow change for watched property', function (t) {
    t.plan(1);

    const model = {
        property1: 'test1',
        property2: 'test2',
        property3: 'test3',
        property4: 'test4',
    };

    const observableModel = new ObservableObject(model, null, { watchKeys: ['property4'] });

    observableModel.data.property4 = 'hello';
    t.equal(observableModel.data.property4, 'hello');
});


test('disallow getting non-watched property', function (t) {
    t.plan(1);

    const model = {
        property1: 'test1',
        property2: 'test2',
        property3: 'test3',
        property4: 'test4',
    };

    const observableModel = new ObservableObject(model, null, { watchKeys: ['property5'] });
    t.equal(observableModel.data.property4, undefined);
});

test('change property that was not present at start', function (t) {
    t.plan(1);

    const model = {
        property1: 'test1',
        property2: 'test2',
        property3: 'test3',
        property4: 'test4',
    };

    const observableModel = new ObservableObject(model, null);

    observableModel.data.property6 = 'hello';
    t.equal(observableModel.data.property6, 'hello');
});

test('disallow property change that was not present at start', function (t) {
    t.plan(1);

    const model = {
        property1: 'test1',
        property2: 'test2',
        property3: 'test3',
        property4: 'test4',
    };

    const observableModel = new ObservableObject(model, null, { watchCurrentKeysOnly: true });

    observableModel.data.property6 = 'hello';
    t.equal(observableModel.data.property6, undefined);
});


test('observe array', function (t) {
    t.plan(2);

    const model = [0,1,2,3,4,5];

    const observableModel = new ObservableObject(model, function(name, value) {
        t.equal(name, '1');
        t.equal(value, 3);
    });

    observableModel.data[1] = 3;
});
