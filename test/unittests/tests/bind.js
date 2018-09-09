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
    binding.add(observableA, true, true);
    binding.add(observableB, true, true);

    observableA.data.a = 10;
    t.equal(observableB.data.a, 10);
});

test('fail to bind property not defined on object to another object', function (t) {
    t.plan(1);

    const observableA = new ObservableObject({ a: 1, b: 2, c: 3});
    const observableB = new ObservableObject({ z: 100, x: 101, y: 102 }, null, ObservableObject.WATCH_CURRENT_ONLY);
    const binding = new Bind();
    binding.add(observableA, true, true);
    binding.add(observableB, true, true);

    observableA.data.a = 10;
    t.equal(observableB.data.a, undefined);
});

test('bind callback', function (t) {
    t.plan(3);

    const observableA = new ObservableObject({ a: 1, b: 2, c: 3});
    const observableB = new ObservableObject({ z: 100, x: 101, y: 102 });
    const binding = new Bind();
    binding.addCallback( (obj, name, value) => {
        t.equal(observableA, obj);
        t.equal(name, 'a');
        t.equal(value, 10);
    });
    binding.add(observableA, true, true);
    binding.add(observableB, true, true);

    observableA.data.a = 10;
});

test('bind callback added from constructor', function (t) {
    t.plan(3);

    const observableA = new ObservableObject({ a: 1, b: 2, c: 3});
    const observableB = new ObservableObject({ z: 100, x: 101, y: 102 });
    const binding = new Bind((obj, name, value) => {
        t.equal(observableA, obj);
        t.equal(name, 'a');
        t.equal(value, 10);
    });
    binding.add(observableA, true, true);
    binding.add(observableB, true, true);

    observableA.data.a = 10;
});

test('bind callback to watch single value', function (t) {
    t.plan(3);

    const observableA = new ObservableObject({ a: 1, b: 2, c: 3});
    const observableB = new ObservableObject({ z: 100, x: 101, y: 102 });
    const binding = new Bind();
    binding.addCallback( (obj, name, value) => {
        t.equal(observableA, obj);
        t.equal(name, 'b');
        t.equal(value, 13);
    }, 'b');
    binding.add(observableA, true, true);
    binding.add(observableB, true, true);

    observableA.data.a = 10; // not watched in callback
    observableA.data.b = 13;
});

test('remove binding callback', function (t) {
    t.plan(1);

    const observableA = new ObservableObject({ a: 1, b: 2, c: 3});
    const observableB = new ObservableObject({ z: 100, x: 101, y: 102 });
    const binding = new Bind();
    binding.addCallback( (obj, name, value) => {
        t.fail('Binding was removed, so this should not be called')
    });
    binding.add(observableA, true, true);
    binding.add(observableB, true, true);
    binding.remove(observableA);
    observableA.data.a = 10;

    setTimeout(function() {
        t.pass(); // give some time to fail, then pass
    }, 10);
});
