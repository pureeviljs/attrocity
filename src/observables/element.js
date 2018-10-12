import AbstractObservable from "./abstractobservable.js";

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

        this._element = el;

        const scope = this;
        this._model = new Proxy({}, {
            get: function(target, name) {
                return scope._element.getAttribute(name);
            },
            set: function(target, prop, value) {
                if (scope._watchList.length === 0 ||
                    scope._watchList.indexOf(prop) !== -1) {
                    scope._element.setAttribute(prop, value);
                }
                return true;
            }
        });
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
        if (this._ignoreNextChange) {
            this._ignoreNextChange = false;
            return;
        }

        for (let c = 0; c < e.length; c++) {
            if (this._watchList.length === 0 || this._watchList.indexOf(e[c].attributeName) !== -1) {
                this.dispatchChange(e[c].target, e[c].attributeName, e[c].target.getAttribute(e[c].attributeName), e[c].oldValue);
            }
        }
    }
}
