import AbstractObservable from "./abstractobservable.js";
import Binding from '../bind.js';

export default class ObservableObject extends AbstractObservable {
    /**
     * constructor
     * @param {Object} object to watch
     * @param {Function} cb callback
     * @param {Array | String} watchlist list of attributes to watch on element (if null, watch them all)
     */
    constructor(obj, cb, watchlist, name) {
        super(obj, cb, watchlist);
        if (name) { this._name = name; }
        this._rawdata = obj;
        this._model = this._createProxy();
        this._observing = true;
    }

    /**
     * stop observation
     */
    stop() {
        this._observing = false;
    }

    /**
     * get data
     * @returns {*}
     */
    get data() {
        return this._model;
    }
}
