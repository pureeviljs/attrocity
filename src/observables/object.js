import AbstractObservable from "./abstractobservable.js";

export default class ObservableObject extends AbstractObservable {
    /**
     * constructor
     * @param {Object} object to watch
     * @param {Function} cb callback
     * @param {Array | String} watchlist list of attributes to watch on element (if null, watch them all)
     */
    constructor(obj, cb, watchlist) {
        super(obj, cb, watchlist);

        const scope = this;
        this._model = new Proxy(obj, {
            get: function(target, name) {
                if (scope.allowAllKeys ||
                    scope.keys.indexOf(name) !== -1) {
                    return target[name];
                } else {
                    return undefined;
                }
            },
            set: function(target, prop, value) {
                if (scope.allowAllKeys ||
                    scope.keys.indexOf(prop) !== -1) {
                    const oldvalue = target[prop];
                    target[prop] = value;

                    if (!scope._ignoreNextChange && scope._observing) {
                        scope.dispatchChange(scope, prop, value, oldvalue);
                    }
                    scope._ignoreNextChange = false;
                    return true;
                }
                scope._ignoreNextChange = false;
                return true;

            }
        });
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
