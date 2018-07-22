const MapDOM = require('../attrocity.js').MapDOM;
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
                        </div>`);
const el = dom.window.document.querySelector('.example');

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

    const dom = MapDOM.map(el, { attribute: 'map', root: null });
    t.equal(dom['more-text-span'].getAttribute('cache'), 'shouldnotgetpickedup');

});
