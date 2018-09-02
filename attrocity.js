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

    class MapDOM {
        /**
         * defaults
         * @returns {{attribute: string, root: string}}
         */
        static get defaults() {
            return {
                attribute: 'cache',
                root: 'cacheroot',
                type: 'cachetype'
            }
        };

        /**
         * generate attribute selector for query selection
         * @param name
         * @returns {string}
         */
        static attributeSelector(name) { return '[' + name + ']'; };

        /**
         * map dom elements with desired attribute to object
         * @param node
         * @param opts
         */
        static map(node, opts) {
            opts = Object.assign(this.defaults, opts ? opts : {} );
            const selector = this.attributeSelector(opts.attribute);

            let domcache = {};
            let els = node.querySelectorAll(selector);
            let rootlevelEls = node.querySelectorAll(this.attributeSelector(opts.root));

            let nondeepEls = [];
            // weed out selections past the desired root
            for (let e = 0; e < els.length; e++) {
                let elIsContainedByRoot = false;
                for (let d = 0; d < rootlevelEls.length; d++) {
                    if (rootlevelEls[d] !== els[e] && rootlevelEls[d].contains(els[e])) {
                        elIsContainedByRoot = true;
                    }
                }
                if (!elIsContainedByRoot) {
                    nondeepEls.push(els[e]);
                }
            }

            // map to object
            for (let c = 0; c < nondeepEls.length; c++) {
                let props = nondeepEls[c].getAttribute(opts.attribute);
                let type = nondeepEls[c].getAttribute(opts.type);

                let level = domcache;
                props = props.split('.');
                props = props.reverse();

                while (props.length > 0) {
                    let prop = props.pop();

                    if (!level[prop]) {
                        if (props.length === 0) {
                            level[prop] = nondeepEls[c];
                            if (type === 'array') {
                                level[prop] = [ nondeepEls[c] ];
                            } else {
                                level[prop] = nondeepEls[c];
                            }
                        } else {
                            level[prop] = {};
                        }
                        level = level[prop];
                    } else {
                        // already populated and wasn't marked as cachetype=array, turn key/value into key/array
                        if (!Array.isArray(level[prop])) {
                            level[prop] = [ level[prop] ];
                        }
                        level[prop].push(nondeepEls[c]);
                    }
                    level = level[prop];
                }
            }
            return domcache;
        };
    }

    class AbstractObservable {
        /**
         * constructor
         * @param obj
         * @param {Function} cb
         */
        constructor(obj, cb) {
            this._model = obj;
            this._id = Symbol();
            this._callbacks = new Map();

            if (cb) {
                this.addCallback(cb);
            }
        }

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
         * get data
         * @returns {*}
         */
        get data() { return this._model; }

        /**
         * add multiple callbacks
         * @param cb
         */
        addCallbacks(cb) { this.addCallback(cb); }

        /**
         * add callback
         * @param cb
         * @returns {symbol}
         */
        addCallback(cb) {
            if (Array.isArray(cb)) {
                for (let c = 0; c < cb.length; c++) {
                    this.addCallback(cb[c]);
                }
                return;
            }
            const id = Symbol();
            this._callbacks.set(id, cb);
            return id;
        }

        /**
         * remove callback
         * @param id
         */
        removeCallback(id) {
            this._callbacks.delete(id);
        }

        /**
         * dispatch change
         * @param obj
         * @param name
         * @param value
         */
        dispatchChange(obj, name, value) {
            this._callbacks.forEach(cb => {
                cb.apply(this, [obj, name, value]);
            });
        }
    }

    class ObservableElement extends AbstractObservable {
        /**
         * constructor
         * @param {HTMLElement} el element to watch
         * @param {Function} cb callback
         * @param {Array} watchlist list of attributes to watch on element (if null, watch them all)
         */
        constructor(el, cb, watchlist) {
            super(el, cb);
            this.observer = new MutationObserver(e => this.onMutationChange(e));
            this.observer.observe(el, { attributes: true });
            this._watchlist = watchlist;
        }

        /**
         * stop observation
         */
        stop() {
            this.observer.disconnect();
        }

        /**
         * set attribute value by name
         * @param attr
         * @param value
         * @param donotdispatch
         */
        setKey(attr, value, donotdispatch) {
            if (donotdispatch) {
                this._ignoreNextMutationChange = true;
            }
            this.data.setAttribute(attr, value);
        }

        /**
         * get attribute value for key/name
         * @param attr
         * @returns {*}
         */
        getKey(attr) {
            return this._data.getAttribute(attr);
        }

        /**
         * mutation change handler
         * @param e
         */
        onMutationChange(e) {
            if (this._ignoreNextMutationChange) {
                this._ignoreNextMutationChange = false;
                return;
            }

            if (this._watchlist && this._watchlist.indexOf(e[c].attributeName) !== -1) {
                return;
            }

            for (let c = 0; c < e.length; c++) {
                this.dispatchChange(e[c].target, e[c].attributeName, e[c].target.getAttribute(e[c].attributeName));
            }
        }
    }

    class ObservableObject extends AbstractObservable {
        /**
         * constructor
         * @param object to watch
         * @param {Function} cb callback
         * @param {Array} watchlist list of attributes to watch on element (if null, watch them all)
         */
        constructor(obj, cb, watchlist) {
            super(obj, cb);
            this._propertyAccessors = {};
            this._observing = true;
            if (!watchlist) {
                this.autoWire();
            } else {
                for (let c = 0; c < watchlist.length; c++) {
                    this.addProperty(watchlist[c]);
                }
            }
        }

        /**
         * stop observation
         */
        stop() {
            this._observing = false;
        }


        /**
         * get data
         * @returns {*}
         */
        get data() {
            return this._propertyAccessors;
        }


        /**
         * automatically detect all property keys and add listeners
         */
        autoWire() {
            const keys = Object.keys(this._model);
            for (let c = 0; c < keys.length; c++) {
                this.addProperty(keys[c]);
            }
        }

        /**
         * set key value by name
         * @param {String} name
         * @param value to set
         * @param {Boolean} donotdispatch - set key, but don't cause change event
         */
        setKey(name, value, donotdispatch) {
            if (this._model[name] === value) {
                return;
            }
            this._model[name] = value;
            if (!donotdispatch && this._observing) {
                this.dispatchChange(this, name, value);
            }
        }

        /**
         * get value for key
         * @param {String} name
         * @returns {*}
         */
        getKey(name) {
            return this._model[name];
        }

        /**
         * add listener for property
         * @param {String} name
         */
        addProperty(name) {
            let scope = this;
            Object.defineProperty(this._propertyAccessors, name, {
                configurable: false,
                enumerable: true,
                set: function (v) {
                    scope.setKey(name, v);
                },
                get: function () {
                    return scope.getKey(name);
                }
            });
        }
    }

    class Binding {
        /**
         * constructor
         */
        constructor(callbacks) {
            this._destinations = new Map();
            this._sources = new Map();
            this._namedCallbacks = {};

            if (!callbacks) {
                this._callbacks = [];
            }
            if (callbacks && !Array.isArray(callbacks)) {
                this._callbacks = [callbacks];
            }
        }

        addCallback(cb, name) {
            if (!name) {
                this._callbacks.push(cb);
            } else {
                if (!this._namedCallbacks[name]) {
                    this._namedCallbacks[name] = [];
                }
                this._namedCallbacks[name].push(cb);
            }
        }

        /**
         * add binding
         * @param {AbstractObservable} obj
         * @param {Boolean} isSrc is a binding source
         * @param {Boolean} isDest is a binding destination
         */
        add(obj, isSrc, isDest) {
            if (obj instanceof AbstractObservable === false) {
                console.error('Adding binding for non-observable object', obj);
                return;
            }
            if (isSrc) {
                const cbID = obj.addCallback( (obj, key, value) => this._onDataChange(obj, key, value));
                this._sources.set(obj.id, { observable: obj, callback: cbID });
            }
            if (isDest) {
                this._destinations.set(obj.id, { observable: obj });
            }
        }

        /**
         * remove binding for object
         * @param {AbstractObservable} obj
         */
        remove(obj) {
            const dest = this._destinations.get(obj.id);
            dest.observable.removeCallback(dest.observable.callback);
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
        _onDataChange(obj, key, value) {
            for (const dest of this._destinations.entries()){
                if (obj.id !== dest[1].observable.id) {
                    dest[1].observable.setKey(key, value, true);
                }
            }
            for (let c = 0; c < this._callbacks.length; c++) {
                this._callbacks[c].apply(this, [obj, key, value]);
            }

            if (this._namedCallbacks[key]) {
                for (let c = 0; c < this._namedCallbacks[key].length; c++) {
                    this._namedCallbacks[key][c].apply(this, [obj, key, value]);
                }

            }
        }
    }

    class CastingRules {
        static defaultRule(value) {
            if (value === 'true') { return true; }
            if (value === 'false') { return false; }
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

    class CustomElementBindingManager {
        constructor() {
            this._observables = {};
            this._binding = new Binding();
            this._rules = new CastingRules();
        }

        get binding() {
            return this._binding;
        }

        get castingRules() {
            return this._rules;
        }

        addRule(key, rule) {
            this._rules.addRule(key, rule);
        }

        addCallback(cb, name) {
            if (!name) {
                this.binding.addCallback( (object, name, value) => {
                    cb(name, this._rules.cast(name, value));
                });
            } else {
                this.binding.addCallback( (object, name, value) => {
                    cb(this._rules.cast(name, value));
                }, name);
            }
        }

        add(name, observable, isSrc, isDest) {
            this._observables[name] = observable;
            this._binding.add(observable, isSrc, isDest);
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
                    if (this.__attrocity.getObservable('customelement').ignoreNextChange
                    || !this.__attrocity.getObservable('customelement')._observing ) { return; }
                    this.__attrocity.getObservable('customelement').dispatchChange(this, name, newValue);
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
            scope.__attrocity.add('customelement', new ObservableCustomElement(scope), true, true);
            return scope.__attrocity;
        }


        /**
         * constructor
         * @param {HTMLElement} el element to watch
         * @param {Function} cb callback
         */
        constructor(el, cb) {
            super(el, cb);
            this._observing = true;
        }

        /**
         * stop observation
         */
        stop() {
            this._observing = false;
        }

        /**
         * set attribute value by name
         * @param attr
         * @param value
         * @param donotdispatch
         */
        setKey(attr, value, donotdispatch) {
            if (donotdispatch) {
                this.ignoreNextChange = true;
            }
            this.data.setAttribute(attr, value);
        }

        /**
         * get attribute value for key/name
         * @param attr
         * @returns {*}
         */
        getKey(attr) {
            return this._data.getAttribute(attr);
        }
    }

    class Main {

        /**
         * Convert
         * @returns {Convert}
         * @constructor
         */
        static get Convert() { return Convert; }

        /**
         * MapDOM
         * @returns {MapDOM}
         * @constructor
         */
        static get MapDOM() { return MapDOM; }

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
