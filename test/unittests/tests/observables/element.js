const ObservableElement = require('../../../../attrocity.js').Observables.Element;
const test = require('tape');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;


const dom = new JSDOM(`<div class="someclass" test="hi"></div>`);
global.window = dom.window;
global.document = dom.window.document;

require('../../shims/MutationObserver.js');
global.MutationObserver = window.MutationObserver;

const el = dom.window.document.querySelector('div');
global.Element = el.constructor;

test('observe element', function (t) {
    t.plan(2);

    const observableAttr = new ObservableElement(el, (object, name, value) => {
        observableAttr.stop();
        t.equal(name, 'test');
        t.equal(value, 'bye');
    });

    el.setAttribute('test', 'bye');
});