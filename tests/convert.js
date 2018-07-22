const Convert = require('../attrocity-cjs.js').Convert;
const test = require('tape');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM(`<div one="1" two="2" three="3" class="someclass"></div>`);
const el = dom.window.document.querySelector('div');
global.Element = el.constructor;

test('attributes to object', function (t) {
    t.plan(3);

    // convert to object, type convert values, ignore typical HTML attributes
    let obj = Convert.fromAttrs(el);
    let sum = 0;
    for (let c = 0; c < Object.keys(obj).length; c++) {
        sum += obj[Object.keys(obj)[c]];
    }
    t.equal(sum, 6); // treating values as numbers
    t.equal(Convert.toAttrString(obj), 'one="1" two="2" three="3"');

    // convert to object, type convert values, ignore typical HTML attributes
    obj = Convert.fromAttrs(el, { typeConvert: false });
    sum = '';
    for (let c = 0; c < Object.keys(obj).length; c++) {
        sum += obj[Object.keys(obj)[c]];
    }
    t.equal(sum, '123'); // treating values as strings
});

test('attributes to string', function (t) {
    t.plan(3);

    // convert to object, type convert values, ignore typical HTML attributes
    let obj = Convert.fromAttrs(el);

    t.equal(Convert.toAttrString(obj), 'one="1" two="2" three="3"');

    // convert to object, DO NOT type convert values, allow all attributes
    t.equal(Convert.toAttrString(Convert.fromAttrs(el, { typeConvert: false, allowAllAttributes: true }), { allowAllAttributes: true }), 'one="1" two="2" three="3" class="someclass"');

    // convert to object, DO NOT type convert values, ignore specific attributes
    t.equal(Convert.toAttrString(Convert.fromAttrs(el, { typeConvert: false, ignore: ['two'] }), { allowAllAttributes: true }), 'one="1" three="3" class="someclass"');
});

test('set attributes', function (t) {
    t.plan(8);

    const newSpan = dom.window.document.createElement('span');
    Convert.setAttrs(newSpan, Convert.fromAttrs(el) );
    t.equal(newSpan.getAttribute('one'), "1");
    t.equal(newSpan.getAttribute('two'), "2");
    t.equal(newSpan.getAttribute('three'), "3");
    t.equal(newSpan.getAttribute('class'), null);

    const newLabel= dom.window.document.createElement('label');
    Convert.setAttrs(newLabel, el, { allowAllAttributes: true });
    t.equal(newLabel.getAttribute('one'), "1");
    t.equal(newLabel.getAttribute('two'), "2");
    t.equal(newLabel.getAttribute('three'), "3");
    t.equal(newLabel.getAttribute('class'), "someclass");
});

