const ObservableElement = require('../../../../attrocity.js').Observables.Element;
const test = require('tape');
const jsdom = require('jsdom');
require('jsdom-global')();
const { JSDOM } = jsdom;


let dom, el;
require('../../shims/MutationObserver.js');
global.MutationObserver = window.MutationObserver;

function resetEl() {
    dom = new JSDOM(`<div class="someclass" id="target1" test="hi" bind>
                            <div id="target2" bind="a" test="hi"></div>
                            <div id="target3" bind="b" test="hi"></div>
                        </div>`);
    el = dom.window.document.querySelector('div');
}

test('observe element root', function (t) {
    resetEl();
    t.plan(4);

    const observableModel = new ObservableElement(el, (name, value, detail) => {
        observableModel.stop();
        t.equal(name, 'test');
        t.equal(value, 'bye');
        t.equal(detail.keyPath, 'test');
    }, { watchSubtree: true });

    dom.window.document.getElementById('target1').setAttribute('test', 'bye');

    setTimeout( function() {
        t.equal(observableModel.data.test, 'bye');
    }, 100);
});


test('observe element child a', function (t) {
    resetEl();
    t.plan(4);

    const observableModel = new ObservableElement(el, (name, value, detail) => {
        observableModel.stop();
        t.equal(name, 'test');
        t.equal(value, 'bye');
        t.equal(detail.keyPath, 'a.test');
    }, { watchSubtree: true });

    dom.window.document.getElementById('target2').setAttribute('test', 'bye');

    setTimeout( function() {
        t.equal(observableModel.data.a.test, 'bye');
    }, 100);
});

test('observe element child b', function (t) {
    resetEl();
    t.plan(4);

    const observableModel = new ObservableElement(el, (name, value, detail) => {
        observableModel.stop();
        t.equal(name, 'test');
        t.equal(value, 'bye');
        t.equal(detail.keyPath, 'b.test');
    }, { watchSubtree: true });

    dom.window.document.getElementById('target3').setAttribute('test', 'bye');

    setTimeout( function() {
        t.equal(observableModel.data.b.test, 'bye');
    }, 100);
});


test('observe element change root property to identical value', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, (name, value) => {
        observableModel.stop();
        t.fail('Change callback should not be fired when setting to the exact same value');
    }, { watchSubtree: true });

    dom.window.document.getElementById('target1').setAttribute('test', 'hi');

    setTimeout( function() {
        t.pass();
        observableModel.stop();
    }, 50);
});

test('observe element change first child property to identical value', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, (name, value) => {
        observableModel.stop();
        t.fail('Change callback should not be fired when setting to the exact same value');
    }, { watchSubtree: true });

    dom.window.document.getElementById('target2').setAttribute('test', 'hi');

    setTimeout( function() {
        t.pass();
        observableModel.stop();
    }, 50);
});

test('observe element change second child property to identical value', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, (name, value) => {
        observableModel.stop();
        t.fail('Change callback should not be fired when setting to the exact same value');
    }, { watchSubtree: true });

    dom.window.document.getElementById('target3').setAttribute('test', 'hi');

    setTimeout( function() {
        t.pass();
        observableModel.stop();
    }, 50);
});


test('observe attribute that was not present at start (root)', function (t) {
    resetEl();
    t.plan(3);

    const observableModel = new ObservableElement(el, (name, value, detail) => {
        observableModel.stop();
        t.equal(name, 'anotherattribute');
        t.equal(value, 'test');
        t.equal(detail.keyPath, 'anotherattribute');
    }, { watchSubtree: true });

    dom.window.document.getElementById('target1').setAttribute('anotherattribute', 'test');
});

test('observe attribute that was not present at start (child 1)', function (t) {
    resetEl();
    t.plan(3);

    const observableModel = new ObservableElement(el, (name, value, detail) => {
        observableModel.stop();
        t.equal(name, 'anotherattribute');
        t.equal(value, 'test');
        t.equal(detail.keyPath, 'a.anotherattribute');
    }, { watchSubtree: true });

    dom.window.document.getElementById('target2').setAttribute('anotherattribute', 'test');
});

test('observe attribute that was not present at start (child 2)', function (t) {
    resetEl();
    t.plan(3);

    const observableModel = new ObservableElement(el, (name, value, detail) => {
        observableModel.stop();
        t.equal(name, 'anotherattribute');
        t.equal(value, 'test');
        t.equal(detail.keyPath, 'b.anotherattribute');
    }, { watchSubtree: true });

    dom.window.document.getElementById('target3').setAttribute('anotherattribute', 'test');
});

test('change property in watchlist (root)', function (t) {
    resetEl();
    t.plan(3);

    const observableModel = new ObservableElement(el, function(name, value, detail) {
        observableModel.stop();
        t.equal(name, 'anattribute');
        t.equal(value, 'hello');
        t.equal(detail.keyPath, 'anattribute');
    }, { watchKeys: ['anattribute'], watchSubtree: true });

    observableModel.data.anattribute = 'hello';
});

test('change property in watchlist (child 1)', function (t) {
    resetEl();
    t.plan(3);

    const observableModel = new ObservableElement(el, function(name, value, detail) {
        observableModel.stop();
        t.equal(name, 'anattribute');
        t.equal(value, 'hello');
        t.equal(detail.keyPath, 'a.anattribute');
    }, { watchKeys: ['anattribute'], watchSubtree: true });

    observableModel.data.a.anattribute = 'hello';
});

test('change property in watchlist (child 2)', function (t) {
    resetEl();
    t.plan(3);

    const observableModel = new ObservableElement(el, function(name, value, detail) {
        observableModel.stop();
        t.equal(name, 'anattribute');
        t.equal(value, 'hello');
        t.equal(detail.keyPath, 'b.anattribute');
    }, { watchKeys: ['anattribute'], watchSubtree: true });

    observableModel.data.b.anattribute = 'hello';
});


test('allow change for watched property (root)', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, null, { watchKeys: ['anattribute'], watchSubtree: true });

    observableModel.data.anattribute = 'hello';
    t.equal(el.getAttribute('anattribute'), 'hello');
    observableModel.stop();
});

test('allow change for watched property (child 1)', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, null, { watchKeys: ['anattribute'], watchSubtree: true });

    observableModel.data.a.anattribute = 'hello';
    t.equal(dom.window.document.getElementById('target2').getAttribute('anattribute'), 'hello');
    observableModel.stop();
});

test('allow change for watched property (child 2)', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, null, { watchKeys: ['anattribute'], watchSubtree: true });

    observableModel.data.b.anattribute = 'hello';
    t.equal(dom.window.document.getElementById('target3').getAttribute('anattribute'), 'hello');
    observableModel.stop();
});


test('disallow change for non-watched property (root)', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, null, { watchKeys: ['class'], watchSubtree: true });

    observableModel.data.test = 'bye';
    t.equal(el.getAttribute('test'), 'hi');
    observableModel.stop();
});

test('disallow change for non-watched property (child 1)', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, null, { watchKeys: ['class'], watchSubtree: true });

    observableModel.data.a.test = 'bye';
    t.equal(dom.window.document.getElementById('target2').getAttribute('test'), 'hi');
    observableModel.stop();
});

test('disallow change for non-watched property (child 2)', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, null, { watchKeys: ['class'], watchSubtree: true });

    observableModel.data.b.test = 'bye';
    t.equal(dom.window.document.getElementById('target3').getAttribute('test'), 'hi');
    observableModel.stop();
});



test('change property that was not present at start (root)', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, null, { watchSubtree: true });

    observableModel.data.anotherattribute = 'hello';
    t.equal(el.getAttribute('anotherattribute'), 'hello');
    observableModel.stop();
});

test('change property that was not present at start (child 1)', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, null, { watchSubtree: true } );

    observableModel.data.a.anotherattribute = 'hello';

    setTimeout( function() {
        t.equal(dom.window.document.getElementById('target2').getAttribute('anotherattribute'), 'hello');
    }, 100);
    observableModel.stop();
});


test('change property that was not present at start (child 2)', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, null, { watchSubtree: true });

    observableModel.data.b.anotherattribute = 'hello';
    setTimeout( function() {
        t.equal(dom.window.document.getElementById('target3').getAttribute('anotherattribute'), 'hello');
    }, 100);
    observableModel.stop();
});


test('disallow property change that was not present at start (root)', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, null, { watchCurrentKeysOnly: true, watchSubtree: true } );

    observableModel.data.anotherattribute = 'hello';
    t.equal(el.hasAttribute('anotherattribute'), false);
    observableModel.stop();
});

test('disallow property change that was not present at start (child 1)', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, null, { watchCurrentKeysOnly: true, watchSubtree: true } );

    observableModel.data.a.anotherattribute = 'hello';
    t.equal(dom.window.document.getElementById('target2').hasAttribute('anotherattribute'), false);
    observableModel.stop();
});

test('disallow property change that was not present at start (child 2)', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, null, { watchCurrentKeysOnly: true, watchSubtree: true } );

    observableModel.data.b.anotherattribute = 'hello';
    t.equal(dom.window.document.getElementById('target3').hasAttribute('anotherattribute'), false);
    observableModel.stop();
});

