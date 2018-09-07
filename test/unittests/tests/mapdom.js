const MapDOM = require('../../../attrocity.js').MapDOM;
const test = require('tape');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM(`<div class="example">
                            <h1 cache="header">a header</h1>
                            <span cache="text" map="text-span">some text</span>
                            <div>
                                <div>
                                    <label class="aclass" cache="textInputLabel">text input label</label>
                                    <input cache="textInput" type="text" value="some text value"/>
                                    <div cacheroot>
                                        <div>
                                            <span cache="shouldnotgetpickedup" map="more-text-span">more text</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="example2">
                            <ul>
                                <li cache="items" secondarycache="items"></li>
                                <li cache="items" thirdcache="items"></li>
                                <li cache="items"></li>
                                <li cache="items"></li>
                                <li cache="items"></li>
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

    const dom = MapDOM.map(el, null, { attribute: 'map', root: null });
    t.equal(dom['more-text-span'].getAttribute('cache'), 'shouldnotgetpickedup');

});

test('map dom with multiple named items being coerced to array', function (t) {
    t.plan(2);

    const dom = MapDOM.map(el2);
    t.equal(Array.isArray(dom.items), true);
    t.equal(dom.items.length, 5);

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
