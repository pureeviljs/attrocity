import AbstractObservable from './observables/abstractobservable.js';
import DotPath from './dotpath.js';

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
