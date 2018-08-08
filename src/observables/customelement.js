import AbstractObservable from "./abstractobservable.js";

export default class ObservableCustomElement extends AbstractObservable {

    /**
     * attach class to web component as a mixin
     * @param clazz
     * @param attributes
     * @param callback
     * @param observableGetterName
     * @returns {*}
     */
    static attach(clazz, attributes, callback, observableGetterName) {
        clazz.prototype.attributeChangedCallback = function(name, oldValue, newValue) {
            if (!this.__$observable$) {
                this.__$observable$ = new ObservableCustomElement(this, callback);
            }

            if (this.__$observable$._ignoreNextChange) {
                return;
            }

            this.__$observable$.dispatchChange(this, name, newValue);
        }

        Object.defineProperty(clazz, 'observedAttributes', {
            get: function() { return [attributes]; }
        });

        if (!observableGetterName) {
            observableGetterName = 'observable';
        }
        Object.defineProperty(clazz.prototype, observableGetterName, {
            get: function() {
                if (!this.__$observable$) {
                    this.__$observable$ = new ObservableCustomElement(this, callback);
                }
                return this.__$observable$;
            }
        });

        return clazz;
    }

    /**
     * constructor
     * @param {HTMLElement} el element to watch
     * @param {Function} cb callback
     */
    constructor(el, cb) {
        super(el, cb);
    }

    /**
     * set attribute value by name
     * @param attr
     * @param value
     * @param donotdispatch
     */
    setKey(attr, value, donotdispatch) {
        if (donotdispatch) {
            this._ignoreNextChange = true;
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
}
