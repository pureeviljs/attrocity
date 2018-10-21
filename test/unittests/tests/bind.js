const Bind = require('../../../attrocity.js').Bind;
const ObservableObject = require('../../../attrocity.js').Observables.Object;
const test = require('tape');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM(`<div one="1" two="2" three="3" class="someclass"></div>`);
const el = dom.window.document.querySelector('div');
global.Element = el.constructor;

test('bind property not defined on object to another object', function (t) {
    t.plan(1);

    const observableA = new ObservableObject({ a: 1, b: 2, c: 3});
    const observableB = new ObservableObject({ z: 100, x: 101, y: 102 });
    const binding = new Bind();
    binding.add(observableA);
    binding.add(observableB);

    observableA.data.a = 10;
    t.equal(observableB.data.a, 10);
});

test('fail to bind property not defined on object to another object', function (t) {
    t.plan(1);

    const observableA = new ObservableObject({ a: 1, b: 2, c: 3});
    const observableB = new ObservableObject({ z: 100, x: 101, y: 102 }, null, ObservableObject.WATCH_CURRENT_ONLY);
    const binding = new Bind();
    binding.add(observableA);
    binding.add(observableB);

    observableA.data.a = 10;
    t.equal(observableB.data.a, undefined);
});

test('bind callback', function (t) {
    t.plan(3);

    const observableA = new ObservableObject({ a: 1, b: 2, c: 3});
    const observableB = new ObservableObject({ z: 100, x: 101, y: 102 }, null, null);
    const binding = new Bind();
    binding.addCallback( (name, value, details) => {
        t.equal(observableA, details.scope);
        t.equal(name, 'a');
        t.equal(value, 10);
    });
    binding.add(observableA);
    binding.add(observableB);

    observableA.data.a = 10;
});


test('bind callback added from constructor', function (t) {
    t.plan(3);

    const observableA = new ObservableObject({ a: 1, b: 2, c: 3});
    const observableB = new ObservableObject({ z: 100, x: 101, y: 102 });
    const binding = new Bind((name, value, details) => {
        t.equal(observableA, details.scope);
        t.equal(name, 'a');
        t.equal(value, 10);
    });
    binding.add(observableA);
    binding.add(observableB);

    observableA.data.a = 10;
});

test('bind callback to watch single value', function (t) {
    t.plan(3);

    const observableA = new ObservableObject({ a: 1, b: 2, c: 3});
    const observableB = new ObservableObject({ z: 100, x: 101, y: 102 });
    const binding = new Bind();
    binding.addCallback( (name, value, details) => {
        t.equal(observableA, details.scope);
        t.equal(name, 'b');
        t.equal(value, 13);
    }, 'b');
    binding.add(observableA);
    binding.add(observableB);

    observableA.data.a = 10; // not watched in callback
    observableA.data.b = 13;
});

test('remove binding callback', function (t) {
    t.plan(1);

    const observableA = new ObservableObject({ a: 1, b: 2, c: 3});
    const observableB = new ObservableObject({ z: 100, x: 101, y: 102 });
    const binding = new Bind();
    binding.addCallback( (name, value) => {
        t.fail('Binding was removed, so this should not be called')
    });
    binding.add(observableA);
    binding.add(observableB);
    binding.remove(observableA);
    observableA.data.a = 10;

    setTimeout(function() {
        t.pass(); // give some time to fail, then pass
    }, 10);
});


test('sync binding values when added (explicit keys)', function (t) {
    t.plan(6);

    const observableA = new ObservableObject({ a: 1, b: 2, c: 3}, null, ['a', 'b', 'c', 'z', 'x', 'y']);
    const observableB = new ObservableObject({ z: 100, x: 101, y: 102 }, null, ['a', 'b', 'c', 'z', 'x', 'y']);
    const binding = new Bind();
    binding.sync(observableA);
    binding.sync(observableB);
    t.equal(observableA.data.z, 100);
    t.equal(observableA.data.x, 101);
    t.equal(observableA.data.y, 102);

    t.equal(observableB.data.a, 1);
    t.equal(observableB.data.b, 2);
    t.equal(observableB.data.c, 3);
});

test('sync binding values when added (allow all keys by not specifying)', function (t) {
    t.plan(6);

    const observableA = new ObservableObject({ a: 1, b: 2, c: 3});
    const observableB = new ObservableObject({ z: 100, x: 101, y: 102 });
    const binding = new Bind();
    binding.sync(observableA);
    binding.sync(observableB);
    t.equal(observableA.data.z, 100);
    t.equal(observableA.data.x, 101);
    t.equal(observableA.data.y, 102);

    t.equal(observableB.data.a, 1);
    t.equal(observableB.data.b, 2);
    t.equal(observableB.data.c, 3);
});


test('dont sync non watched properties (default keys are ones already present)', function (t) {
    t.plan(6);

    const observableA = new ObservableObject({ a: 1, b: 2, c: 3}, null, []);
    const observableB = new ObservableObject({ z: 100, x: 101, y: 102 }, null, []);
    const binding = new Bind();
    binding.sync(observableA);
    binding.sync(observableB);
    t.equal(observableA.data.z, undefined);
    t.equal(observableA.data.x, undefined);
    t.equal(observableA.data.y, undefined);

    t.equal(observableB.data.a, undefined);
    t.equal(observableB.data.b, undefined);
    t.equal(observableB.data.c, undefined);
});

