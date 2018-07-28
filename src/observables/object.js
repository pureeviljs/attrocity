import AbstractObservable from "./abstractobservable.js";

export default class ObservableObject extends AbstractObservable {
    /**
     * constructor
     * @param object to watch
     * @param {Function} cb callback
     * @param {Array} watchlist list of attributes to watch on element (if null, watch them all)
     */
    constructor(obj, cb, watchlist) {
        super(obj, cb);
        if (!watchlist) {
            this.autoWire();
        } else {
            for (let c = 0; c < watchlist.length; c++) {
                this.addProperty(watchlist[c]);
            }
        }
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
        this._model[name] = value;
        if (!donotdispatch) {
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
        Object.defineProperty(this, name, {
            configurable: false,
            enumerable: true,
            set: function (v) {
                this.setKey(name, v);
            },
            get: function () {
                return this.getKey(name);
            }
        });
    }
}
