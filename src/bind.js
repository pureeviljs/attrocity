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
            if (!this._namedCallbacks[name]) {
                this._namedCallbacks[name] = [];
            }
            this._namedCallbacks[name].push({ callback: cb });
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

        Binding.log({action: 'add', target: obj });

        if (!direction || direction === Binding.PUSH || direction === Binding.TWOWAY) {
            const cbID = obj.addCallback((obj, key, value, oldvalue, originchain) => this._onDataChange(obj, key, value, oldvalue, originchain), this);
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
                Binding.log({action: 'pull', target: dest, source: this });
                dest.data[c] = this._aggregateValues[c];
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
    _onDataChange(obj, key, value, oldvalue, originchain) {
        if (!originchain) { originchain = []; }
        originchain.push(this);

        this._aggregateValues[key] = value;
        for (const dest of this._destinations.entries()){
            if (obj.id !== dest[1].observable.id && originchain.indexOf(dest[1].observable) === -1) {
                Binding.log({action: 'push', source: this, target: dest[1].observable, origin: originchain });
                dest[1].observable._setKey(key, value, originchain);
            }
        }

        for (let c = 0; c < this._callbacks.length; c++) {
            if (!this._callbacks[c].scope || originchain.indexOf(this._callbacks[c].scope) === -1) {
                Binding.log({action: 'bindingchange', source: obj, target: this._callbacks[c].scope, origin: originchain });
                this._callbacks[c].callback.apply(this, [obj, key, value, oldvalue, originchain]);
            }
        }

        if (this._namedCallbacks[key]) {
            for (let c = 0; c < this._namedCallbacks[key].length; c++) {
                if (!this._namedCallbacks[key][c].scope || originchain.indexOf(this._namedCallbacks[key][c].scope) === -1) {
                    Binding.log({action: 'bindingchange', source: this, target: this._namedCallbacks[key][c].scope, origin: originchain });
                    this._namedCallbacks[key][c].callback.apply(this, [obj, key, value, oldvalue, originchain]);
                }
            }

        }
    }

    static log(o) {
        if (Binding.debugMode || this.debugMode) {
            console.log('----------');
            console.log('* ' + o.action);

            let src, dest;
            if (o.source) { src = o.source.name; }
            if (o.target) { dest = o.target.name; }
            if (src === undefined) { src = ''; }
            if (dest === undefined) { dest = ''; }
            if (src || dest) {
                console.log(src + ' -> ' + dest);
            }

            if (o.origin && o.origin.length > 0) {
                console.log('origins:', o.origin.map( i => { return i.name } ).join(','))
            }

            if (o.key) {        console.log( ' - key -       :', o.key )}
            if (o.value) {      console.log( ' - value -     :', o.value )}
            if (o.oldValue) {   console.log( ' - old value - :', o.value )}
        }
    }

}
