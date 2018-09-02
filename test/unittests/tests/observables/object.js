const ObservableObject = require('../../../../attrocity.js').Observables.Object;
const test = require('tape');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM(`<div one="1" two="2" three="3" class="someclass"></div>`);
const el = dom.window.document.querySelector('div');
global.Element = el.constructor;

test('observe object', function (t) {
    t.plan(2);

    const model = {
        property1: 'test1',
        property2: 'test2',
        property3: 'test3',
        property4: 'test4',
    };

    const observableModel = new ObservableObject(model, function(object, name, value) {
        t.equal(name, 'property1');
        t.equal(value, 'hello1');
    });

    observableModel.data.property1 = 'hello1';
});


test('observe array', function (t) {
    t.plan(2);

    const model = [0,1,2,3,4,5];

    const observableModel = new ObservableObject(model, function(object, name, value) {
        t.equal(name, '1');
        t.equal(value, 3);
    });

    observableModel.data[1] = 3;
});
