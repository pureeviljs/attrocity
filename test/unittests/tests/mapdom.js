const MapDOM = require('../../../attrocity.js').Map;
const test = require('tape');
const jsdom = require('jsdom');
require('jsdom-global')();
const { JSDOM } = jsdom;

const dom = new JSDOM(`<div class="example">
                            <h1 map="header">a header</h1>
                            <span map="text" map="text-span">some text</span>
                            <div>
                                <div>
                                    <label class="aclass" map="textInputLabel">text input label</label>
                                    <input map="textInput" type="text" value="some text value"/>
                                    <div maproot>
                                        <div>
                                            <span map="shouldnotgetpickedup" cache="more-text-span">more text</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="example2">
                            <ul>
                                <li map="items" secondarycache="items"></li>
                                <li map="items" thirdcache="items"></li>
                                <li map="items"></li>
                                <li map="items"></li>
                                <li map="items"></li>
                            </ul>
                        </div>`);
const el = dom.window.document.querySelector('.example');
const el2 = dom.window.document.querySelector('.example2');

test('map dom with default settings', function (t) {
    t.plan(4);

    const dom = MapDOM.map(el);

    t.equal(dom.textInput.value, 'some text value');
    t.equal(dom.textInputLabel.classList.contains('aclass'), true);
    t.equal(dom.text.innerHTML, 'some text');
    t.equal(dom.shouldnotgetpickedup, undefined);
});



test('map dom with non-default settings', function (t) {
    t.plan(1);

    const dom = MapDOM.map(el, null, { attribute: 'cache', root: null });
    t.equal(dom['more-text-span'].getAttribute('map'), 'shouldnotgetpickedup');

});

test('map dom with multiple named items being coerced to array', function (t) {
    t.plan(2);

    const map = MapDOM.map(el2);
    t.equal(Array.isArray(map.items), true);
    t.equal(map.items.length, 5);

});

test('map dom with one named item not being coerced to array', function (t) {
    t.plan(1);

    const dom = MapDOM.map(el2, null, { attribute: 'secondarycache' });
    t.equal(Array.isArray(dom.items), false);
});


test('map dom with one named item specified as array', function (t) {
    t.plan(2);

    const dom = MapDOM.map(el2, { items: [] }, { attribute: 'thirdcache' });
    t.equal(Array.isArray(dom.items), true);
    t.equal(dom.items.length, 1);

});

test('map dom starting with one item, adding more from DOM', function (t) {
    t.plan(2);

    const dom = MapDOM.map(el2, { items: ['test'] }, { attribute: 'thirdcache' });
    t.equal(Array.isArray(dom.items), true);
    t.equal(dom.items.length, 2);

});
