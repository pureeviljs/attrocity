import DotPath from '../dotpath.js';

export default class AbstractObservable {
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
            this._primaryCallback = this.addCallback(cb, this);
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
            // if this observable wasn't part of the origin chain or it directly occured then allow callback
            if (details.originChain.indexOf(cb.scope) === -1 || details.originChain.length === 1) {
                cb.callback.apply(this, [ name, value, {
                    observable: this,
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
        const scope = this;
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
