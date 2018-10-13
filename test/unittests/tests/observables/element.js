const ObservableElement = require('../../../../attrocity.js').Observables.Element;
const test = require('tape');
const jsdom = require('jsdom');
require('jsdom-global')();
const { JSDOM } = jsdom;


const dom = new JSDOM(`<div class="someclass" test="hi"></div>`);
require('../../shims/MutationObserver.js');
global.MutationObserver = window.MutationObserver;

const el = dom.window.document.querySelector('div');

function resetEl() {
    el.setAttribute('class', 'someclass');
    el.setAttribute('test', 'hi');
    el.removeAttribute('anattribute');
    el.removeAttribute('anotherattribute');
}

test('observe element', function (t) {
    resetEl();
    t.plan(3);

    const observableModel = new ObservableElement(el, (object, name, value) => {
        observableModel.stop();
        t.equal(name, 'test');
        t.equal(value, 'bye');
    });

    el.setAttribute('test', 'bye');

    t.equal(observableModel.data.test, 'bye');
});

test('observe element change property to identical value', function (t) {
    resetEl();
    el.setAttribute('test', 'hi');
    t.plan(1);

    const observableModel = new ObservableElement(el, (object, name, value, oldValue) => {
        observableModel.stop();
        t.fail('Change callback should not be fired when setting to the exact same value');
    });

    el.setAttribute('test', 'hi');

    setTimeout( function() {
        t.pass();
        observableModel.stop();
    }, 50);
});

test('observe element ignoring first change', function (t) {
    resetEl();
    t.plan(2);

    const observableModel = new ObservableElement(el, (object, name, value) => {
        observableModel.stop();
        t.equal(name, 'test');
        t.equal(value, 'byebye');
    });

    observableModel.ignoreNextChange();
    el.setAttribute('test', 'bye');

    setTimeout( function() {
        el.setAttribute('test', 'byebye');
    }, 50);
});

test('observe attribute that was not present at start', function (t) {
    resetEl();
    t.plan(2);

    const observableModel = new ObservableElement(el, (object, name, value) => {
        observableModel.stop();
        t.equal(name, 'anotherattribute');
        t.equal(value, 'test');
    });

    el.setAttribute('anotherattribute', 'test');
});

test('change property in watchlist', function (t) {
    resetEl();
    t.plan(2);

    const observableModel = new ObservableElement(el, function(object, name, value) {
        observableModel.stop();
        t.equal(name, 'anattribute');
        t.equal(value, 'hello');
    }, ['anattribute']);

    observableModel.data.anattribute = 'hello';
});


test('allow change for watched property', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, null, ['anattribute']);

    observableModel.data.anattribute = 'hello';
    t.equal(el.getAttribute('anattribute'), 'hello');
    observableModel.stop();
});

test('disallow change for non-watched property', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, null, ['class']);

    observableModel.data.test = 'bye';
    t.equal(el.getAttribute('test'), 'hi');
    observableModel.stop();
});

test('change property that was not present at start', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, null);

    observableModel.data.anotherattribute = 'hello';
    t.equal(el.getAttribute('anotherattribute'), 'hello');
    observableModel.stop();
});

test('disallow property change that was not present at start', function (t) {
    resetEl();
    t.plan(1);

    const observableModel = new ObservableElement(el, null, ObservableElement.WATCH_CURRENT_ONLY);

    observableModel.data.anotherattribute = 'hello';
    t.equal(el.hasAttribute('anotherattribute'), false);
    observableModel.stop();
});