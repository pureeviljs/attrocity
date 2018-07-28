import AbstractObservable from './observables/abstractobservable.js';

export default class Binding {
    /**
     * constructor
     */
    constructor() {
        this._destinations = new Map();
        this._sources = new Map();
    }

    /**
     * add binding
     * @param {AbstractObservable} obj
     * @param {Boolean} isSrc is a binding source
     * @param {Boolean} isDest is a binding destination
     */
    add(obj, isSrc, isDest) {
        if (!obj instanceof AbstractObservable) {
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
    }
}
