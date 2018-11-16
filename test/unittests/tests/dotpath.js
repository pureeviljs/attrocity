const DotPath = require('../../../attrocity.js').DotPath;
const test = require('tape');

test('dot path at level', function (t) {
    t.plan(6);

    const obj = { a: { b: { c: { d: { e: 'hi '}}}}};

    let dp = DotPath.toPath(obj, obj.a.b.c.d.e);
    t.equal(dp, 'a.b.c.d.e');

    dp = DotPath.toPath(obj, obj.a.b.c.d);
    t.equal(dp, 'a.b.c.d');

    dp = DotPath.toPath(obj, obj.a.b.c);
    t.equal(dp, 'a.b.c');

    dp = DotPath.toPath(obj, obj.a.b);
    t.equal(dp, 'a.b');

    dp = DotPath.toPath(obj, obj.a);
    t.equal(dp, 'a');

    dp = DotPath.toPath(obj, obj);
    t.equal(dp, '');
});

test('less straightforward paths', function (t) {
    t.plan(2);

    const obj = { a: { b: { c: { d: { e: 'hi '}}, findme: { notme: 5, me: { hi: 'found' } }}}};

    let dp = DotPath.toPath(obj, obj.a.b.findme.me.hi);
    t.equal(dp, 'a.b.findme.me.hi');

    dp = DotPath.toPath(obj, obj.a.b.findme.me);
    t.equal(dp, 'a.b.findme.me');
});


test('level at dot path', function (t) {
    t.plan(7);

    const obj = { a: { b: { c: { d: { e: 'hi '}}}}};

    // weird instance because e is a leaf, and the desire is to get enclosing object
    let o = DotPath.resolvePath('a.b.c.d.e', obj, { alwaysReturnObject: true });
    t.equal(o, obj.a.b.c.d);

    o = DotPath.resolvePath('a.b.c.d.e', obj);
    t.equal(o, obj.a.b.c.d.e);

    o = DotPath.resolvePath('a.b.c.d', obj);
    t.equal(o, obj.a.b.c.d);

    o = DotPath.resolvePath('a.b.c', obj);
    t.equal(o, obj.a.b.c);

    o = DotPath.resolvePath('a.b', obj);
    t.equal(o, obj.a.b);

    o = DotPath.resolvePath('a', obj);
    t.equal(o, obj.a);

    o = DotPath.resolvePath('', obj);
    t.equal(o, obj);
});

test('another variation', function (t) {
    t.plan(2);

    const obj = { a: 1, b: 2, c: { prop1: 3, prop2: 4 }};
    let o = DotPath.resolvePath('c', obj);
    t.equal(o, obj.c);

    const obj1 = { a: { b: { c: { prop1: 3, prop2: 4 }}}};
    o = DotPath.resolvePath('a.b.c', obj1);
    t.equal(o, obj1.a.b.c);
});

test('get level at non-existing path', function (t) {
    t.plan(1);

    const obj = {};
    DotPath.resolvePath('a.b', obj);
    obj.a.b = 5;
    t.equal(obj.a.b, 5);
});

test('use case that previously failed', function (t) {
    t.plan(1);

    const obj = { anothertest: null, test: 'testy' };
    let o = DotPath.resolvePath('anothertest', obj, { alwaysReturnObject: true });
    t.equal(o, obj);
});
