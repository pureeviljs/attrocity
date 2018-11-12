(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.attrocity = factory());
}(this, (function () { 'use strict';

    /**
     * Conversion between Objects, Elements, Attributes, and Strings
     */
    class Convert {
        /**
         * default ignore list for attributes
         * @returns {string[]}
         */
        static get ignore() { return [ 'class' ]; };

        /**
         * default settings for most methods in module
         * @returns {{allowAllAttributes: boolean, typeConvert: boolean, ignore: *}}
         */
        static get defaults() {
            return {
                allowAllAttributes: false,
                typeConvert: true,
                ignore: this.ignore
            }
        };

        /**
         * object from element attribtues
         * @param {Object} el element
         * @param {Object} opts options {
         *          allowAllAttributes: boolean to allow all attributes to come through, default false
         *          typeConvert: boolean to allow conversion of numbers from strings
         *          ignore: Array of attributes to ignore default [class]
         * @return object/dictionary
         */
        static fromAttrs(el, opts) {
            opts = Object.assign(this.defaults, opts ? opts : {} );
            const o = {};
            const attributes = el.attributes;
            for (let c = 0; c < attributes.length; c++) {
                if (opts.ignore.indexOf(attributes[c].nodeName) === -1 || opts.allowAllAttributes) {
                    let val = attributes[c].nodeValue;
                    if (!isNaN(parseFloat(val)) && opts.typeConvert) {
                        val = parseFloat(val);
                    }
                    o[attributes[c].nodeName] = val;
                }
            }
            return o;
        };

        /**
         * set attributes of an element sourced from an object
         * @param {Object} el element to accept object mapping
         * @param {Object} obj object to map to element
         * @param {Object} opts options {
         *          allowAllAttributes: boolean to allow all attributes to come through, default false
         *          typeConvert: boolean to allow conversion of numbers from strings
         *          ignore: Array of attributes to ignore default [class]
         * @returns {*} element
         */
        static setAttrs(el, obj, opts) {
            opts = Object.assign(this.defaults, opts ? opts : {} );
            if (obj instanceof Element) {
                obj = this.fromAttrs(obj, opts);
            }
            const keys = Object.keys(obj);
            for (let c = 0; c < keys.length; c++) {
                if (opts.ignore.indexOf(keys[c]) === -1 || opts.allowAllAttributes) {
                    if (typeof obj[keys[c]] === 'string' || typeof obj[keys[c]] === 'number') {
                        el.setAttribute(keys[c], obj[keys[c]]);
                    }
                }
            }
            return el;
        };

        /**
         * convert to string of attributes (myattr="value" anotherattr="value")
         * @param {Object} obj simple flat obj or element
         * @param {Object} opts options {
         *          allowAllAttributes: boolean to allow all attributes to come through, default false
         *          typeConvert: boolean to allow conversion of numbers from strings
         *          ignore: Array of attributes to ignore default [class]
         * @returns {string}
         */
        static toAttrString(obj, opts) {
            opts = Object.assign(this.defaults, opts ? opts : {} );

            if (obj instanceof Element) {
                obj = this.fromAttrs(obj, opts);
            }

            const keys = Object.keys(obj);
            let str = '';
            for (let c = 0; c < keys.length; c++) {
                if (opts.ignore.indexOf(keys[c]) === -1 || opts.allowAllAttributes) {
                    if (typeof obj[keys[c]] === 'string' || typeof obj[keys[c]] === 'number') {
                        str += keys[c] + '="' + obj[keys[c]] + '" ';
                    }
                }
            }
            return str.trimRight();
        }
    }

    /**
     * Conversion between Dot path notation and objects
     */
    class DotPath {
        static getKeysAtLevel(level) {
            return Object.keys(level);
        }

        /**
         * level has children
         * @param level
         */
        static isParent(level) {
            if (typeof level === 'object') {
                return true;
            } else {
                return false;
            }
        }

        /**
         * is a key/value pair and not a parent
         * @param level
         * @returns {boolean}
         */
        static isValue(level) {
            if (typeof level !== 'object') {
                return true;
            } else {
                return false;
            }
        }

        static appendKeyToPath(path, key) {
            let p = path + '.' + key;
            if (p.charAt(0) === '.') {
                p = p.substr(1, p.length);
            }
            return p;
        }

        static toPath(root, target) {
            return DotPath.toPathArray(root, target).join('.');
        }

        /**
         * get dot path notation from object
         * @param root
         * @param target
         * @param dotpath
         * @returns {*}
         */
        static toPathArray(root, target, path) {
            if (path === undefined) {
                path = [];
            }
            if (root === target) {
                return path;
            }
            const keys = DotPath.getKeysAtLevel(root);
            for (let key in keys) {
                const k = keys[key];
                if (DotPath.isParent(root[k])) {
                    const p = DotPath.toPathArray(root[k], target, [k]);
                    if (p) {
                        return path.concat(DotPath.toPathArray(root[k], target, [k]));
                    }
                } else if (root[k] === target) {
                    return path.concat([k]);
                }
            }
        }

        /**
         * resolve dot path from object
         * Adapted from:
         * Credit: https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
         * https://stackoverflow.com/users/6782/alnitak
         * @param s
         * @param o
         * @param {boolean} objects only
         * @returns {*}
         */
        static resolvePath(s, o, opts) {
            if (!opts) { opts = {}; }
            if (s === '') { return o; }
            s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
            s = s.replace(/^\./, '');           // strip a leading dot
            var a = s.split('.');
            for (var i = 0, n = a.length; i < n; ++i) {
                var k = a[i];
                if (DotPath.isParent(o) && k in o) {
                    if (!(opts.alwaysReturnObject && DotPath.isValue(o[k]))) {
                        o = o[k];
                    }
                } else if (DotPath.isParent(o)) { // o is not in k, create the object
                    // exit at current level, we got this far and it only can lead here
                    if (i === n-1 && !opts.lastSegmentIsObject) {
                        // end of the line, we didn't find the last path seg, just return so far
                        return o;
                    } else {
                        o[k] = {}; // keep going, we didn't find this path seg, so need to create
                        return o[k];
                    }
                }
            }
            return o;
        }
    }

    class AbstractObservable {
        /**
         * constructor
         * @param obj
         * @param {Function} cb
         * @param options
         */
        constructor(obj, cb, opts) {
            this._tree = new Map();
            this._model = obj;
            this._id = Symbol();
            this._name = '';
            this._callbacks = new Map();
            this._observing = true;

            if (cb) {
                this._primaryCallback = this.addCallback(cb);
            }

            if (opts) {
                if (Array.isArray(opts.watchKeys)) {
                    this._keys = opts.watchKeys.slice();
                } else if (opts.watchCurrentKeysOnly) {
                    this._allowCurrentKeysOnly = true;
                } else {
                    this._allowAllKeys = true;
                }
            } else {
                this._allowAllKeys = true;
            }
        }

        /**
         * getter for isObservable to check if we inherit from this class
         * @returns {boolean}
         */
        get isObservable() { return true; }

        /**
         * stop observation
         */
        stop() {}

        /**
         * get ID
         * @returns {symbol | *}
         */
        get id() { return this._id; }

        /**
         * get name
         * @returns string
         */
        get name() { return this._name; }

        /**
         * set name
         * @param string
         */
        set name(val) { this._name = val; }

        /**
         * get data
         * @returns {*}
         */
        get data() {
            return this._tree.get(this._rawdata);
        }

        /**
         * get allowAllKeys bool
         * @returns {boolean}
         */
        get allowAllKeys() {
            return this._allowAllKeys;
        }

        /**
         * add callback
         * @param cb
         * @param scope
         * @returns {symbol}
         */
        addCallback(cb, scope) {
            const id = Symbol();
            this._callbacks.set(id, { callback: cb, scope: scope });
            return id;
        }

        /**
         * remove callback
         * @param id
         */
        removeCallback(id) {
            if (!id) {
                id = this._primaryCallback;
            }
            this._callbacks.delete(id);
        }

        /**
         * dispatch change
         * @param obj
         * @param name
         * @param value
         * @param oldValue
         */
        dispatchChange(name, value, details) {
            if (value === details.oldValue) { return; }
            if (!details.originChain) { details.originChain = [details.scope]; }
            this._callbacks.forEach(cb => {
                if (details.originChain.indexOf(cb.scope) === -1) {
                    cb.callback.apply(this, [ name, value, {
                        target: details.target,
                        keyPath: details.keyPath,
                        key: name,
                        value: value,
                        oldValue: details.oldValue,
                        originChain: details.originChain,
                        scope: details.scope }]);
                }
            });
        }

        _createProxy() {
            this._tree.set(this._rawdata, new Proxy(this._rawdata, this.validator));
        }

        _keyAllowed(key, target) {
            return this.allowAllKeys || (this._keys && this._keys.indexOf(key) !== -1) || (this._allowCurrentKeysOnly && target[key] !== undefined);
        }

        _setRawValue(target, key, value) {
            target[key] = value;
        }

        _getRawValue(target, key) {
            return target[key];
        }

        _getKey(target, key) {
            if (this._keyAllowed(key, target)) {
                return this._getRawValue(target, key);
            } else {
                return undefined;
            }
        }

        _setKey(target, prop, value, originchain) {
            if (!originchain) { originchain = []; }
            originchain.push(this);

            if (typeof target === 'string') {
                target = DotPath.resolvePath(target, this._rawdata, { alwaysReturnObject: true });
            }

            if (this._keyAllowed(prop, target)) {
                const oldvalue = this._getRawValue(target, prop);
                this._setRawValue(target, prop, value);
                if (this._observing) {
                    this.dispatchChange(prop, value, {
                        oldValue: oldvalue,
                        originChain: originchain,
                        scope: this,
                        key: prop,
                        get keyPath() {
                            let dotpath = prop;
                            if (target !== this.scope._rawdata) {
                                dotpath = DotPath.toPath(this.scope._rawdata, target) + '.' + prop;
                            }
                            return dotpath;
                        },
                        value: value,
                        target: target });
                }
            }
        }

        get validator() {
            const scope = this;
            return {
                get: function(target, key) {
                    if (typeof target[key] === 'object' && target[key] !== null) {
                        if (!scope._tree.has(target[key])) {
                            scope._tree.set(target[key], new Proxy(target[key], scope.validator));
                        }
                        return scope._tree.get(target[key]);
                    } else {
                        return scope._getKey(target, key);
                    }
                },
                set: function(target, prop, value) {
                    scope._setKey(target, prop, value);
                    return true;

                }
            };
        }
    }

    class Binding {
        static get PUSH() { return 'push'; }
        static get PULL() { return 'pull'; }
        static get TWOWAY() { return 'twoway'; }

        /**
         * constructor
         */
        constructor(cb) {
            this._destinations = new Map();
            this._sources = new Map();
            this._namedCallbacks = {};
            this._aggregateValues = {};
            this._callbacks = [];
            this._name = '';

            if (cb) {
                this.addCallback(cb);
            }
        }

        get name() {
            return this._name;
        }

        set name(val) {
            this._name = val;
        }

        addCallback(cb, name) {
            if (!name) {
                this._callbacks.push({ callback: cb  });
            } else {
                if (!Array.isArray(name)) {
                    name = [name];
                }

                for (let c = 0; c < name.length; c++) {
                    if (!this._namedCallbacks[name[c]]) {
                        this._namedCallbacks[name[c]] = [];
                    }
                    this._namedCallbacks[name[c]].push({ callback: cb });
                }
            }
        }

        /**
         * add binding
         * @param {AbstractObservable} obj
         * @param {String} direction binding direction
         */
        add(obj, direction) {
            direction = direction ? direction : Binding.TWOWAY;
            this._name += '|' + obj.name + '@' + direction + '|';
            if (obj.isObservable === false) {
                console.error('Adding binding for non-observable object', obj);
                return;
            }

            if (!direction || direction === Binding.PUSH || direction === Binding.TWOWAY) {
                const cbID = obj.addCallback((key, value, details) =>
                        this._onDataChange(key, value, details), this);
                this._sources.set(obj.id, { observable: obj, callback: cbID });
            }
            if (!direction || direction === Binding.PULL || direction === Binding.TWOWAY) {
                this._destinations.set(obj.id, { observable: obj });
            }
        }

        /**
         * sync current values and add binding
         * @param {AbstractObservable} obj
         * @param {String} direction binding direction
         */
        sync(obj, direction) {
            this.add(obj, direction);
            if (!direction || direction === Binding.PUSH || direction === Binding.TWOWAY) {
                this.pushAllValues(obj);
            }

            if (!direction || direction === Binding.PULL || direction === Binding.TWOWAY) {
                this.pullAllValues(obj.data);
            }

        }

        /**
         * recursively iterate through source and dispatch changes for each value
         * as though it were changed live
         * @param src
         * @param level
         */
        pushAllValues(src, level, path) {
            if (!level) {
                level = src.data;
            }
            if (!path) {
                path = '';
            }

            const keys = DotPath.getKeysAtLevel(level);
            for (let key in keys) {
                const k = keys[key];
                if (level[k] !== undefined) {
                    // is a simple key/val pair, report value
                    if (DotPath.isValue(level[k])) {
                        let kpath = DotPath.appendKeyToPath(path, k);
                        this._onDataChange(k, level[k], {scope: src, keyPath: kpath});
                    }

                    if (DotPath.isParent(level[k])) {
                        this.pushAllValues(src, level[k], path + '.' + k);
                    }
                }
            }
        }


        /**
         * recursively iterate through aggregate values on each model
         * and change on destination as though it were changed live
         * @param src
         * @param level
         */
        pullAllValues(nesteddest, level) {
            if (!level) {
                level = this._aggregateValues;
            }

            const keys = DotPath.getKeysAtLevel(level);
            for (let key in keys) {
                const k = keys[key];
                if (level[k] !== undefined) {
                    if (DotPath.isValue(nesteddest[k])) {
                        nesteddest[k] = level[k];
                    } else  if (DotPath.isParent(nesteddest[k])) {
                        this.pullAllValues(nesteddest[k], level[k]);
                    }
                }
            }
        }

        /**
         * remove binding for object
         * @param {AbstractObservable} obj
         */
        remove(obj) {
            const src = this._sources.get(obj.id);
            src.observable.removeCallback(src.callback);
            this._destinations.delete(obj.id);
            this._sources.delete(obj.id);
        }

        /**
         * on data changed from source
         * @param {AbstractObservable} obj
         * @param {String} key name of changed attribute
         * @param value value of changed attribute
         * @private
         */
        _onDataChange(key, value, details) {
            if (!details.originChain) { details.originChain = []; }
            details.originChain.push(this);

            let valueTarget = DotPath.resolvePath(details.keyPath, this._aggregateValues, { alwaysReturnObject: true });
            valueTarget[key] = value;

            for (const dest of this._destinations.entries()){
                if (details.scope.id !== dest[1].observable.id && details.originChain.indexOf(dest[1].observable) === -1) {
                    dest[1].observable._setKey(details.keyPath, key, value, details.originChain);
                }
            }

            for (let c = 0; c < this._callbacks.length; c++) {
                if (!this._callbacks[c].scope || details.originChain.indexOf(this._callbacks[c].scope) === -1) {
                    this._callbacks[c].callback.apply(this, [key, value, { oldValue: details.oldValue, originChain: details.originChain, scope: details.scope }]);
                }
            }

            if (this._namedCallbacks[key]) {
                for (let c = 0; c < this._namedCallbacks[key].length; c++) {
                    if (!this._namedCallbacks[key][c].scope || details.originChain.indexOf(this._namedCallbacks[key][c].scope) === -1) {
                        this._namedCallbacks[key][c].callback.apply(this, [key, value, { oldValue: details.oldValue, originChain: details.originChain, scope: details.scope }]);
                    }
                }

            }
        }
    }

    class MapDOM {
        /**
         * defaults
         * @returns {{attribute: string, root: string}}
         */
        static get mapdefaults() {
            return {
                attribute: 'map',
                root: 'maproot'
            }
        };

        /**
         * defaults
         * @returns {{attribute: string, root: string}}
         */
        static get wiredefaults() {
            return {
                attribute: 'wire',
                root: 'maproot'
            }
        };

        /**
         * generate attribute selector for query selection
         * @param name
         * @returns {string}
         */
        static _attributeSelector(name) { return '[' + name + ']'; };

        /**
         * map dom elements with desired attribute to object
         * @param node
         * @param startingObj
         * @param opts
         */
        static map(node, startingObj, opts) {
            opts = Object.assign(this.mapdefaults, opts ? opts : {} );
            const selector = this._attributeSelector(opts.attribute);

            let domcache = startingObj ? startingObj : {};
            let els = node.querySelectorAll(selector);
            let rootlevelEls = node.querySelectorAll(this._attributeSelector(opts.root));

            els = this._filterElementsContainedByRoot(els, rootlevelEls);

            for (let e = 0; e < els.length; e++) {
                let path = els[e].getAttribute(opts.attribute).split('.');
                const prop = path.pop();
                const deepref = this._ensurePropertyPath(domcache, path);
                this._setProperty(deepref, prop, els[e]);

            }
            return domcache;
        };

        static wire(node, callback, scope, opts) {
            opts = Object.assign(this.wiredefaults, opts ? opts : {} );
            const selector = this._attributeSelector(opts.attribute);
            let els = node.querySelectorAll(selector);
            let rootlevelEls = node.querySelectorAll(this._attributeSelector(opts.root));

            els = this._filterElementsContainedByRoot(els, rootlevelEls);
            for (let e = 0; e < els.length; e++) {
                const eventtypes = els[e].getAttribute(opts.attribute).split(',');
                for (let c = 0; c < eventtypes.length; c++) {
                    els[e].addEventListener(eventtypes[c], e => { callback.apply(scope, [e]); });
                }
            }
        }

        static wireElements(els, events, callback, scope) {
            if (!Array.isArray(els)) {
                els =  [els];
            }
            let eventtypes = events;
            if (!Array.isArray(events)) {
                eventtypes = eventtypes.split(',');
            }
            for (let d = 0; d < els.length; d++) {
                for (let c = 0; c < eventtypes.length; c++) {
                    els[d].addEventListener(eventtypes[c].trim(), e => { callback.apply(scope, [e]); });
                }
            }
        }

        /**
         * ensure deep or shallow path exists on object
         * @param obj
         * @param propslist
         * @return deep reference
         */
        static _ensurePropertyPath(obj, propslist) {
            propslist = propslist.reverse();
            let parent;
            let parentProp;
            while (propslist.length > 0) {
                const prop = propslist.pop();
                if (!obj[prop]) {
                    obj[prop] = {};
                }
                parent = obj;
                obj = obj[prop];
                parentProp = prop;
            }
            return { current: obj, parent: parent, parentProp: parentProp };
        }

        /**
         * set property on object
         * @param obj
         * @param prop
         * @param val
         * @private
         */
        static _setProperty(obj, prop, val) {
            let ref = obj.current;
            let parent = obj.parent;
            let parentProp = obj.parentProp;
            if (!ref[prop]) {
                // element already set on prop, but we're adding more key/values to it as an object
                // roll back to parent and set object that can hold all
                if (ref instanceof Element) {
                    parent[parentProp] = {};
                    parent[parentProp][parentProp] = ref;
                    parent[parentProp][prop] = val;
                } else {
                    ref[prop] = val;
                }
            } else if (ref[prop] instanceof Element) {
                // element already exists on key, turn into array holding list
                ref[prop] = [ ref[prop] ];
                ref[prop].push(val);
            } else if (Array.isArray(ref[prop])) {
                ref[prop].push(val);
            } else if (Object.keys(ref[prop]).length > 0) {
                // key being set is already an object containing keys, bump this key further down the chain
                ref[prop][prop] = val;
            }
        }

        /**
         * remove elements contained by marked roots
         * @param els
         * @param roots
         * @returns {Array}
         */
        static _filterElementsContainedByRoot(els, roots) {
            const nondeepEls = [];
            for (let e = 0; e < els.length; e++) {
                let elIsContainedByRoot = false;
                for (let d = 0; d < roots.length; d++) {
                    if (roots[d] !== els[e] && roots[d].contains(els[e])) {
                        elIsContainedByRoot = true;
                    }
                }
                if (!elIsContainedByRoot) {
                    nondeepEls.push(els[e]);
                }
            }
            return nondeepEls;
        }
    }

    class CastingRules {
        static defaultRule(value) {
            if (value === 'true') { return true; }
            if (value === 'false') { return false; }
            if (typeof value === 'boolean') { return value; }
            if (!isNaN(Number(value))) { return Number(value); }
            return value;
        }

        constructor() {
            this._rules = new Map();
            this._rules.set('*', [ CastingRules.defaultRule ]);

        }

        addRule(key, rule) {
            if (key === '*') {
                this._rules.get(key).push(rule);
            } else if (Array.isArray(key)) {
                for (let c = 0; c < key.length; c++) {
                    this.addRule(key[c], rule );
                }
            } else {
                this._rules.set(key, rule);
            }
        }

        cast(key, value) {
            let val = value;
            const genericRules = this._rules.get('*');
            for (let c = 0; c < genericRules.length; c++) {
                val = genericRules[c](val);
            }

            if (this._rules.has(key)) {
                return this._rules.get(key)(val);
            } else {
                return val;
            }
        }

    }

    class ObservableElement extends AbstractObservable {
        /**
         * constructor
         * @param {HTMLElement} el element to watch
         * @param {Function} cb callback
         * @param opts
         */
        constructor(el, cb, opts) {
            super(el, cb, opts);

            if (!opts) { opts = {}; }
            this.observer = new MutationObserver(e => this.onMutationChange(e));
            this.observer.observe(el, { attributes: true, attributeOldValue: true, subtree: opts.watchSubtree });

            this.element = el;
            this.name = el.tagName;

            this._parentKey = opts.parentAttribute ? opts.parentAttribute : 'parent';
            this._watchSubtree = opts.watchSubtree ? opts.watchSubtree : false;
            this._rawdata = this._elementsToObject();
            this._createProxy();
        }

        /**
         * create object from local DOM tree
         * @private
         */
        _elementsToObject() {
            const assign = (el, data) => {
                let dotpath = '';
                if (el.hasAttribute(this._parentKey)) {
                    dotpath = el.getAttribute(this._parentKey);
                }

                const obj = Convert.fromAttrs(el, { ignore: [ this._parentKey ]});

                const level = DotPath.resolvePath(dotpath, data, { alwaysReturnObject: true, lastSegmentIsObject: true });
                Object.assign(level, obj);
            };

            let data = {};
            assign(this.element, data);
            let els = this.element.querySelectorAll('[' + this._parentKey + ']');
            for (let c = 0; c < els.length; c++) {
                assign(els[c], data);
            }

            return data;
        }

        _setRawValue(target, key, value) {
            super._setRawValue(target, key, value);

            if (this._watchSubtree) {
                const dotpath = DotPath.toPath(this._rawdata, target);
                const els = this.element.querySelectorAll(`[${this._parentKey}="${dotpath}"]`);
                for (let c = 0; c < els.length; c++) {
                    els[c].setAttribute(key, value);
                }

                // since root level el isn't in the querySelector, see if we should update
                if (this.element.getAttribute(this._parentKey) === dotpath) {
                    this.element.setAttribute(key, value);
                }
            } else {
                this.element.setAttribute(key, value);
            }
        }

        /**
         * stop observation
         */
        stop() {
            super.stop();
            this.observer.disconnect();
        }

        /**
         * mutation change handler
         * @param e
         */
        onMutationChange(e) {
            for (let c = 0; c < e.length; c++) {
                if (this._keyAllowed(e[c].attributeName, e[c].target.attributes)) {
                    let dotpath = '';
                    if (e[c].target.hasAttribute(this._parentKey)) {
                        dotpath = e[c].target.getAttribute(this._parentKey);
                    }
                    dotpath = DotPath.appendKeyToPath(dotpath, e[c].attributeName);

                    const target = DotPath.resolvePath(dotpath, this._rawdata, { alwaysReturnObject: true });
                    super._setRawValue(target, e[c].attributeName, e[c].target.getAttribute(e[c].attributeName));
                    this.dispatchChange(
                        e[c].attributeName,
                        e[c].target.getAttribute(e[c].attributeName), {
                            keyPath: dotpath,
                            key: e[c].attributeName,
                            value: e[c].target.getAttribute(e[c].attributeName),
                            oldValue: e[c].oldValue,
                            originChain: [this],
                            target: e[c].target,
                            scope: this._rawdata });
                }
            }
        }
    }

    class ObservableObject extends AbstractObservable {
        /**
         * constructor
         * @param {Object} object to watch
         * @param {Function} cb callback
         * @param opts
         */
        constructor(obj, cb, opts) {
            super(obj, cb, opts);
            if (opts && opts.name) { this._name = opts.name; }
            this._rawdata = obj;
            this._createProxy();
        }

        /**
         * stop observation
         */
        stop() {
            this._observing = false;
        }
    }

    class CustomElementBindingManager {
        constructor() {
            this._observables = {};
            this._binding = new Binding();
            this._rules = new CastingRules();
            this._name = ['CustomElementBindingManager'];
        }

        get binding() {
            return this._binding;
        }

        get castingRules() {
            return this._rules;
        }

        get name() {
            return this._name.join('*');
        }

        addRule(key, rule) {
            this._rules.addRule(key, rule);
        }

        addCallback(cb, name) {
            if (!name) {
                this.binding.addCallback((name, value, details) => {
                    if (!details.originChain) {
                        details.originChain = [];
                    }
                    details.originChain.push(this);
                    cb(name, this._rules.cast(name, value), { oldValue: details.oldvalue, originChain: details.originChain, scope: details.scope });
                });
            } else {
                this.binding.addCallback((name, value, details) => {
                    if (!details.originChain) {
                        details.originChain = [];
                    }
                    details.originChain.push(this);
                    cb(name, this._rules.cast(name, value), { oldValue: details.oldvalue, originChain: details.originChain, scope: details.scope });
                }, name);
            }
        }

        add(observable, bindingdirection, name) {
            if (!name) {
                name = observable.constructor.name;
            }
            this._observables[name] = observable;
            this._binding.add(observable, bindingdirection);
            this._name.push(observable.name);
            return this._binding;
        }

        sync(observable, bindingdirection, name) {
            if (!name) {
                name = observable.constructor.name;
            }
            this._observables[name] = observable;
            this._binding.sync(observable, bindingdirection);
            this._name.push(observable.name);
            return this._binding;
        }

        getObservable(name) {
            return this._observables[name];
        }
    }

    class ObservableCustomElement extends AbstractObservable {
        /**
         * attach class to web component as a mixin
         * @param clazz
         * @returns {*}
         */
        static attach(clazz) {
            clazz.prototype.attributeChangedCallback = function (name, oldValue, newValue) {
                if (this.__attrocity) {
                    let originchain = [];
                    if (this.__attrocity.originChainContinuity) {
                        originchain = this.__attrocity.originChainContinuity;
                    }
                    this.__attrocity.originChainContinuity = [];
                    if (!this.__attrocity.getObservable('customelement')._observing ) { return; }
                    const ce = this.__attrocity.getObservable('customelement');
                    ce.dispatchChange(name, newValue, { oldValue: oldValue, originChain: originchain, scope: ce });
                }
            };
            return clazz;
        }

        /**
         * create bindings on instance
         * @param scope
         * @param opts
         * @returns {CustomElementBindingManager}
         */
        static createBindings(scope, opts) {
            scope.__attrocity = new CustomElementBindingManager();
            scope.__attrocity.sync(new ObservableCustomElement(scope,
                (name, val, { oldValue: old, originChain: originchain, scope: o }) => { scope.__attrocity.originChainContinuity = originchain; },
                scope.constructor.observedAttributes),
                Binding.TWOWAY, 'customelement');
            return scope.__attrocity;
        }


        /**
         * constructor
         * @param {HTMLElement} el element to watch
         * @param {Function} cb callback
         */
        constructor(el, cb) {
            super(el, cb, el.constructor.observedAttributes);

            this._observing = true;

            this._rawdata = el;
            this.name = el.tagName;
            this._createProxy();

        }

        _setRawValue(key, value) {
            this._rawdata.setAttribute(key, value);
        }

        _getRawValue(key) {
            if (this._rawdata.getAttribute(key)) {
                return this._rawdata.getAttribute(key);
            } else {
                return undefined;
            }
        }

        _setKey(prop, value, originchain) {
            if (!originchain) { originchain = []; }
            originchain.push(this);

            if (this._keyAllowed(prop)) {
                const oldvalue = this._getRawValue(prop);
                this._setRawValue(prop, value);

                Binding.log({action: 'setvalue', key: prop, target: this, origin: originchain });
            }
        }

        /**
         * stop observation
         */
        stop() {
            this._observing = false;
        }
    }

    class Main {
        /**
         * Bind
         * @returns {Convert}
         * @constructor
         */
        static get Bind() { return Binding; }

        /**
         * Convert
         * @returns {Convert}
         * @constructor
         */
        static get Convert() { return Convert; }

        /**
         * Convert
         * @returns {Convert}
         * @constructor
         */
        static get DotPath() { return DotPath; }

        /**
         * MapDOM
         * @returns {MapDOM}
         * @constructor
         */
        static get MapDOM() { return MapDOM; }

        /**
         * Casting
         * @returns {CastingRules}
         * @constructor
         */
        static get CastingRules() { return CastingRules; }

        /**
         * Observables
         * @returns {{Element: ObservableElement, Object: ObservableObject}}
         * @constructor
         */
        static get Observables() {
            return {
                Element: ObservableElement,
                CustomElement: ObservableCustomElement,
                Object: ObservableObject
            }
        }
    }

    return Main;

})));
//# sourceMappingURL=attrocity.js.map
