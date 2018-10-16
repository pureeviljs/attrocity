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
