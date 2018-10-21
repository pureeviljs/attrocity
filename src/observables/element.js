import AbstractObservable from "./abstractobservable.js";
import Binding from "../bind.js";

export default class ObservableElement extends AbstractObservable {
    /**
     * constructor
     * @param {HTMLElement} el element to watch
     * @param {Function} cb callback
     * @param {Array} watchlist list of attributes to watch on element (if null, watch them all)
     */
    constructor(el, cb, watchlist) {
        super(el, cb, watchlist);
        this.observer = new MutationObserver(e => this.onMutationChange(e));
        this.observer.observe(el, { attributes: true, attributeOldValue: true });

        this._rawdata = el;
        this.name = el.tagName;

        this._model = this._createProxy();
    }

    _setRawValue(key, value) {
        this._rawdata.setAttribute(key, value);
    }

    _getRawValue(key) {
        if (this._rawdata.getAttribute(key)) {
            return this._rawdata.getAttribute(key);
        } else {
            return undefined;
        }
    }

    /**
     * stop observation
     */
    stop() {
        this.observer.disconnect();
    }

    /**
     * mutation change handler
     * @param e
     */
    onMutationChange(e) {
        for (let c = 0; c < e.length; c++) {
            if (this.keys.length === 0 || this.keys.indexOf(e[c].attributeName) !== -1) {
                this.dispatchChange(e[c].target, e[c].attributeName, e[c].target.getAttribute(e[c].attributeName), e[c].oldValue, [this]);
            }
        }
    }
}
