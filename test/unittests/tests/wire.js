const MapDOM = require('../../../attrocity.js').Map;
const test = require('tape');
const jsdom = require('jsdom');
require('jsdom-global')();
const { JSDOM } = jsdom;

const dom = new JSDOM(`<div class="example">
                            <button wire="click">Click me</button>
                        </div>`);
const el = dom.window.document.querySelector('.example');

test('wire click event', function (t) {
    t.plan(1);

    const el = dom.window.document.querySelector('.example');
    MapDOM.wire(el, function(e) {
        t.equal(e.type, 'click');
    });

    dom.window.document.querySelector('button').click();
});
