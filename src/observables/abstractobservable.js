import Binding from '../bind.js';

export default class AbstractObservable {
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
        this._name = '';
        this._callbacks = new Map();
        this._allowAllKeys = false;

        if (cb) {
            this._primaryCallback = this.addCallback(cb);
        }

        if (Array.isArray(watchlist)) {
            this._keys = watchlist.slice();

        } else {
            switch(watchlist) {
                case AbstractObservable.WATCH_ANY:
                    this._allowAllKeys = true;
                    break;

                case AbstractObservable.WATCH_CURRENT_ONLY:
                    if (obj instanceof Element) {
                        let wl = Array.from(obj.attributes);
                        this._keys = wl.map( i => { return i.name });
                    } else {
                        this._keys = Object.keys(obj);
                    }
                    break;

                default:
                    // default to watch any and all
                    this._allowAllKeys = true;
                    break;

            }
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
    get data() { return this._model; }

    /**
     * get allowAllKeys bool
     * @returns {boolean}
     */
    get allowAllKeys() {
        return this._allowAllKeys;
    }

    /**
     * get keys
     * @returns {string[] | *}
     */
    get keys() {
        if (this._keys) {
            return this._keys;
        } else {
            return Object.keys(this._model);
        }
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
                Binding.log({action: 'observablechange', target: cb.scope, source: details.scope, origin: details.originChain, key: name, value: value, old: details.oldValue });
                cb.callback.apply(this, [name, value, { oldValue: details.oldValue, originChain: details.originChain, scope: details.scope }]);
            }
        });
    }

    _createProxy() {
        const scope = this;
        return new Proxy(this._rawdata, {
            get: function(target, name) {
                return scope._getKey(name);
            },
            set: function(target, prop, value) {
                scope._setKey(prop, value);
                return true;

            }
        });
    }

    _keyAllowed(key) {
        return this.allowAllKeys || this.keys.indexOf(key) !== -1;
    }

    _setRawValue(key, value) {
        this._rawdata[key] = value;
    }

    _getRawValue(key) {
        return this._rawdata[key];
    }

    _getKey(prop) {
        if (this._keyAllowed(prop)) {
            Binding.log({action: 'getvalue', key: prop, source: this });
            return this._getRawValue(prop);
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

            if (this._observing) {
                this.dispatchChange(prop, value, { oldValue: oldvalue, originChain: originchain, scope: this });
            }
        }
    }
}
