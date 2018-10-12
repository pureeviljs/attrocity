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

    class AbstractObservable {
        static get WATCH_ANY() { return 'watch-any'; }
        static get WATCH_CURRENT_ONLY() { return 'watch-current-only'; }

        /**
         * constructor
         * @param obj
         * @param {Function} cb
         */
        constructor(obj, cb, watchlist) {
            this._model = obj;
            this._id = Symbol();
            this._callbacks = new Map();

            if (cb) {
                this._primaryCallback = this.addCallback(cb);
            }

            this._watchList = [];

            if (watchlist) {
                if (Array.isArray(watchlist)) {
                    this._watchList = watchlist.slice();

                } else {
                    switch(watchlist) {
                        case AbstractObservable.WATCH_ANY:
                            // already a blank array, allow all
                            break;

                        case AbstractObservable.WATCH_CURRENT_ONLY:
                            if (obj instanceof Element) {
                                let wl = Array.from(obj.attributes);
                                this._watchList = wl.map( i => { return i.name });
                            } else {
                                this._watchList = Object.keys(obj);
                            }
                            break;
                    }
                }
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
         * do not dispatch event for next change
         */
        ignoreNextChange() {
            this._ignoreNextChange = true;
        }

        /**
         * add callback
         * @param cb
         * @returns {symbol}
         */
        addCallback(cb) {
            const id = Symbol();
            this._callbacks.set(id, cb);
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
        dispatchChange(obj, name, value, oldValue) {
            if (value === oldValue) { return; }
            this._callbacks.forEach(cb => {
                cb.apply(this, [obj, name, value, oldValue]);
            });
        }
    }

    class Binding {
        /**
         * constructor
         */
        constructor(cb) {
            this._destinations = new Map();
            this._sources = new Map();
            this._namedCallbacks = {};
            this._callbacks = [];

            if (cb) {
                this.addCallback(cb);
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
        _onDataChange(obj, key, value) {
            for (const dest of this._destinations.entries()){
                if (obj.id !== dest[1].observable.id) {
                    dest[1].observable.ignoreNextChange();
                    dest[1].observable.data[key] = value;
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

    // TODO: Finish implementing dot notation for nested properties

    class MapDOM {
        /**
         * defaults
         * @returns {{attribute: string, root: string}}
         */
        static get defaults() {
            return {
                attribute: 'cache',
                root: 'cacheroot',
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
         * @param startingObj
         * @param opts
         */
        static map(node, startingObj, opts) {
            opts = Object.assign(this.defaults, opts ? opts : {} );
            const selector = this.attributeSelector(opts.attribute);

            let domcache = startingObj ? startingObj : {};
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
                let level = domcache;
                props = props.split('.');
                props = props.reverse();

                while (props.length > 0) {
                    let prop = props.pop();

                    if (!level[prop]) {
                        if (props.length === 0) {
                            level[prop] = nondeepEls[c];
                        } else {
                            level[prop] = {};
                        }
                        level = level[prop];
                    } else {
                        // already populated, turn key/value into key/array
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
         * @param {Array} watchlist list of attributes to watch on element (if null, watch them all)
         */
        constructor(el, cb, watchlist) {
            super(el, cb, watchlist);
            this.observer = new MutationObserver(e => this.onMutationChange(e));
            this.observer.observe(el, { attributes: true, attributeOldValue: true });

            this._element = el;

            const scope = this;
            this._model = new Proxy({}, {
                get: function(target, name) {
                    return scope._element.getAttribute(name);
                },
                set: function(target, prop, value) {
                    if (scope._watchList.length === 0 ||
                        scope._watchList.indexOf(prop) !== -1) {
                        scope._element.setAttribute(prop, value);
                    }
                    return true;
                }
            });
        }

        /**
         * stop observation
         */
        stop() {
            this.observer.disconnect();
        }

        /**
         * mutation change handler
         * @param e
         */
        onMutationChange(e) {
            if (this._ignoreNextChange) {
                this._ignoreNextChange = false;
                return;
            }

            for (let c = 0; c < e.length; c++) {
                if (this._watchList.length === 0 || this._watchList.indexOf(e[c].attributeName) !== -1) {
                    this.dispatchChange(e[c].target, e[c].attributeName, e[c].target.getAttribute(e[c].attributeName), e[c].oldValue);
                }
            }
        }
    }

    class ObservableObject extends AbstractObservable {
        /**
         * constructor
         * @param {Object} object to watch
         * @param {Function} cb callback
         * @param {Array | String} watchlist list of attributes to watch on element (if null, watch them all)
         */
        constructor(obj, cb, watchlist) {
            super(obj, cb, watchlist);

            const scope = this;
            this._model = new Proxy(obj, {
                get: function(target, name) {
                    return target[name];
                },
                set: function(target, prop, value) {
                    if (scope._watchList.length === 0 ||
                        scope._watchList.indexOf(prop) !== -1) {
                        const oldvalue = target[prop];
                        target[prop] = value;

                        if (!scope._ignoreNextChange && scope._observing) {
                            scope.dispatchChange(scope, prop, value, oldvalue);
                        }
                        scope._ignoreNextChange = false;
                        return true;
                    }

                    scope._ignoreNextChange = false;
                    return true;

                }
            });
            this._observing = true;
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
            return this._model;
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
                    if (this.__attrocity.getObservable('customelement')._ignoreNextChange
                    || !this.__attrocity.getObservable('customelement')._observing ) { return; }
                    this.__attrocity.getObservable('customelement').dispatchChange(this, name, newValue, oldValue);

                    this.__attrocity.getObservable('customelement')._ignoreNextChange = false;
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

            this._element = el;

            const scope = this;
            this._model = new Proxy({}, {
                get: function(target, name) {
                    return scope._element.getAttribute(name);
                },
                set: function(target, prop, value) {
                    // should this be more resrictive in what allows setting by user pref?
                    // observedAttribute list is too limiting i think here
                    scope._element.setAttribute(prop, value);
                    return true;
                }
            });
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
