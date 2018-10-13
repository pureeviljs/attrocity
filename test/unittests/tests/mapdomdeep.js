const MapDOM = require('../../../attrocity.js').MapDOM;
const test = require('tape');
const jsdom = require('jsdom');
require('jsdom-global')();
const { JSDOM } = jsdom;

const dom = new JSDOM(`<div class="example">
                        <h1 cache="header">a header</h1>
                        <h2 cache="header">another header</h2>
                        <h3 id="thirdheader" cache="header">another header</h3>
                        <h4 cache="header">another header</h4>
                
                        <button id="buttonA" cache="demo.button.a">a button</button>
                        <button id="buttonB" cache="demo.button.b">b button</button>
                        <button id="buttonC" cache="demo.button.c">c button</button>
                        <button id="buttonD" cache="demo.button.d">d button</button>
                        <button id="buttonE" cache="demo.button.e">e button</button>
                
                        <span id="lonetextonprop" cache="demo.span">span</span>
                        <span cache="demo.span.f">f span</span>
                        <span cache="demo.span.g">g span</span>
                        <span id="spanh" cache="demo.span.h">h span</span>
                        <span cache="demo.span.i">i button</span>
                
                
                        <span cache="text.someText">some text</span>
                        <div>
                            <div>
                                <label cache="text.inputLabel">text input label</label>
                                <input cache="text.input" type="text" />
                                <div>
                                    <div>
                                        <span cache="text.moreText">more text</span>
                                        <span id="lonetextonprop2" cache="text">object level text</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`);
const el = dom.window.document.querySelector('.example');

test('map dom nested', function (t) {
    t.plan(10);

    const map = MapDOM.map(el);

    t.equal(map.demo.button.a, dom.window.document.getElementById('buttonA') );
    t.equal(map.demo.button.b, dom.window.document.getElementById('buttonB') );
    t.equal(map.demo.button.c, dom.window.document.getElementById('buttonC') );
    t.equal(map.demo.button.d, dom.window.document.getElementById('buttonD') );
    t.equal(map.demo.button.e, dom.window.document.getElementById('buttonE') );

    t.equal(map.header.length, 4);
    t.equal(map.header[2], dom.window.document.getElementById('thirdheader'));

    t.equal(map.text.text, dom.window.document.getElementById('lonetextonprop2'));
    t.equal(map.demo.span.span, dom.window.document.getElementById('lonetextonprop'));
    t.equal(map.demo.span.h, dom.window.document.getElementById('spanh'));

});
