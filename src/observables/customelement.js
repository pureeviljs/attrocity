import AbstractObservable from "./abstractobservable.js";

export default class ObservableCustomElement extends AbstractObservable {
    /**
     * constructor
     * @param {HTMLElement} el element to watch
     * @param {Function} cb callback
     */
    constructor(el, cb) {
        super(el, cb);
        this.data.attributeChangedCallback = (name, oldValue, newValue) => this.dispatchChange(this.data, name, newValue);
    }

    /**
     * set attribute value by name
     * @param attr
     * @param value
     */
    setKey(attr, value) {
        this.data.setAttribute(attr, value);
    }

    /**
     * get attribute value for key/name
     * @param attr
     * @returns {*}
     */
    getKey(attr) {
        return this._data.getAttribute(attr);
    }
}
