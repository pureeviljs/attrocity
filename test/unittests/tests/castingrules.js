const CastingRules = require('../../../attrocity.js').CastingRules;
const test = require('tape');

test('default value casting (no conversion)', function (t) {
    t.plan(5);

    const casting = new CastingRules();
    t.equal(casting.cast('prop', 'a string'), 'a string');
    t.equal(casting.cast('prop', 5), 5);
    t.equal(casting.cast('prop', 0), 0);
    t.equal(casting.cast('prop', true), true);
    t.equal(casting.cast('prop', false), false);
});

test('default value casting, converting problematic type', function (t) {
    t.plan(4);

    const casting = new CastingRules();
    t.equal(casting.cast('prop', '5'), 5);
    t.equal(casting.cast('prop', '0'), 0);
    t.equal(casting.cast('prop', 'true'), true);
    t.equal(casting.cast('prop', 'false'), false);
});

test('adding casting rules', function (t) {
    t.plan(4);

    const casting = new CastingRules();
    casting.addRule('add five rule', function(val) { return val + 5; });
    casting.addRule('to date string', function(val) { return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(val).getUTCDay()]; });

    t.equal(casting.cast('add five rule', 5), 10);
    t.equal(casting.cast('add five rule', '5'), 10);

    t.equal(casting.cast('to date string', 1536458736724), 'Sunday');
    t.equal(casting.cast('to date string', '1536458736724'), 'Sunday');

});

test('universal rule', function (t) {
    t.plan(1);

    const casting = new CastingRules();
    casting.addRule('*', function(val) { return val + ' <- is the result'});

    t.equal(casting.cast('whatever', 'This message'), 'This message <- is the result');
});

test('multi property rule', function (t) {
    t.plan(4);

    const casting = new CastingRules();
    casting.addRule(['a', 'b', 'c'], function(val) { return val + ' <- is the result'});

    t.equal(casting.cast('a', 'This message'), 'This message <- is the result');
    t.equal(casting.cast('b', 'This message'), 'This message <- is the result');
    t.equal(casting.cast('c', 'This message'), 'This message <- is the result');
    t.equal(casting.cast('d', 'This message'), 'This message');
});