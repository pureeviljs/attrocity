import AbstractObservable from "./abstractobservable.js";
import Binding from '../bind.js';

export default class ObservableObject extends AbstractObservable {
    /**
     * constructor
     * @param {Object} object to watch
     * @param {Function} cb callback
     * @param opts
     */
    constructor(obj, cb, opts) {
        super(obj, cb, opts);
        if (opts && opts.name) { this._name = opts.name; }
        this._rawdata = obj;
        this._createProxy();
    }

    /**
     * stop observation
     */
    stop() {
        this._observing = false;
    }
}
