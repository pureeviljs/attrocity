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
