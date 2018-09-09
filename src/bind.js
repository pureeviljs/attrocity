import AbstractObservable from './observables/abstractobservable.js';

export default class Binding {
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
