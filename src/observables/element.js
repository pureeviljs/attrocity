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
                if (scope.allowAllKeys ||
                    scope.keys.indexOf(name) !== -1) {
                    return scope._element.getAttribute(name);
                } else {
                    return undefined;
                }
            },
            set: function(target, prop, value) {
                if (scope.allowAllKeys ||
                    scope.keys.indexOf(prop) !== -1) {
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
            if (this.keys.length === 0 || this.keys.indexOf(e[c].attributeName) !== -1) {
                this.dispatchChange(e[c].target, e[c].attributeName, e[c].target.getAttribute(e[c].attributeName), e[c].oldValue);
            }
        }
    }
}
