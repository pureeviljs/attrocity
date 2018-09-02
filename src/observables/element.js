import AbstractObservable from "./abstractobservable.js";

export default class ObservableElement extends AbstractObservable {
    /**
     * constructor
     * @param {HTMLElement} el element to watch
     * @param {Function} cb callback
     * @param {Array} watchlist list of attributes to watch on element (if null, watch them all)
     */
    constructor(el, cb, watchlist) {
        super(el, cb);
        this.observer = new MutationObserver(e => this.onMutationChange(e));
        this.observer.observe(el, { attributes: true });
        this._watchlist = watchlist;
    }

    /**
     * stop observation
     */
    stop() {
        this.observer.disconnect();
    }

    /**
     * set attribute value by name
     * @param attr
     * @param value
     * @param donotdispatch
     */
    setKey(attr, value, donotdispatch) {
        if (donotdispatch) {
            this._ignoreNextMutationChange = true;
        }
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

    /**
     * mutation change handler
     * @param e
     */
    onMutationChange(e) {
        if (this._ignoreNextMutationChange) {
            this._ignoreNextMutationChange = false;
            return;
        }

        if (this._watchlist && this._watchlist.indexOf(e[c].attributeName) !== -1) {
            return;
        }

        for (let c = 0; c < e.length; c++) {
            this.dispatchChange(e[c].target, e[c].attributeName, e[c].target.getAttribute(e[c].attributeName));
        }
    }
}
