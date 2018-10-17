import AbstractObservable from './observables/abstractobservable.js';

export default class Binding {
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
     * @param {String} direction binding direction
     */
    add(obj, direction) {
        if (obj instanceof AbstractObservable === false) {
            console.error('Adding binding for non-observable object', obj);
            return;
        }
        if (!direction || direction === Binding.PUSH || direction === Binding.TWOWAY) {
            const cbID = obj.addCallback( (obj, key, value) => this._onDataChange(obj, key, value));
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
            this.pushAllValues(obj)
        }

        if (!direction || direction === Binding.PULL || direction === Binding.TWOWAY) {
            this.pullAllValues(obj);
        }

    }

    pushAllValues(src) {
        for (let c = 0; c < src.keys.length; c++) {
            if (src.data[src.keys[c]] !== undefined) {
                this._onDataChange(src, src.keys[c], src.data[src.keys[c]]);
            }
        }
    }

    pullAllValues(dest) {
        for (let c in this._aggregateValues) {
            if (this._aggregateValues[c] !== undefined) {
                dest.data[c] = this._aggregateValues[c]
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
    _onDataChange(obj, key, value) {
        this._aggregateValues[key] = value;
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
