export default class AbstractObservable {
    /**
     * constructor
     * @param obj
     * @param {Function} cb
     */
    constructor(obj, cb) {
        this._model = obj;
        this._id = Symbol();
        this._callbacks = new Map();

        if (cb) {
            this.addCallback(cb);
        }
    }

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
     * add multiple callbacks
     * @param cb
     */
    addCallbacks(cb) { this.addCallback(cb); }

    /**
     * add callback
     * @param cb
     * @returns {symbol}
     */
    addCallback(cb) {
        if (Array.isArray(cb)) {
            for (let c = 0; c < cb.length; c++) {
                this.addCallback(cb[c]);
            }
            return;
        }
        const id = Symbol();
        this._callbacks.set(id, cb);
        return id;
    }

    /**
     * remove callback
     * @param id
     */
    removeCallback(id) {
        this._callbacks.delete(id);
    }

    /**
     * dispatch change
     * @param obj
     * @param name
     * @param value
     */
    dispatchChange(obj, name, value) {
        console.log('dispatch')
        this._callbacks.forEach(cb => {
            cb.apply(this, [obj, name, value]);
        });
    }
}
