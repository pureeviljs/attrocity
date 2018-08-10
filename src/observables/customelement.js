import AbstractObservable from "./abstractobservable.js";

export default class ObservableCustomElement extends AbstractObservable {
    static get attachableMethods() { return {
            attributeChangedCallback: function (name, oldValue, newValue) {
                if (!this.__attrocity.isInitialized) {
                    this.__attrocity.init(this);
                }

                if (this.__attrocity.observables.customElement.ignoreNextChange) {
                    return;
                }

                this.__attrocity.observables.customElement.dispatchChange(this, name, newValue);
            },

            instanceRefs: {
                value: {
                    init: function(scope) {},
                    isInitialized: false,
                    observables: {}
                },
                writable: false
            }
        }
    };

    /**
     * attach class to web component as a mixin
     * @param clazz
     * @param attributes
     * @param callback
     * @param observableGetterName
     * @returns {*}
     */
    static attach(clazz, attributes, callback, observableGetterName) {
        clazz.prototype.attributeChangedCallback = ObservableCustomElement.attachableMethods.attributeChangedCallback;

        Object.defineProperty(clazz, 'observedAttributes', {
            get: function() { return attributes; }
        });

        if (!observableGetterName) { observableGetterName = 'observable'; }
        Object.defineProperty(clazz.prototype, observableGetterName, {
            get: function() {
                if (!this.__attrocity.isInitialized) {
                    this.__attrocity.init(this);
                }
                return this.__attrocity.observables.customElement;
            }
        });

        Object.defineProperty(clazz.prototype, '__attrocity', ObservableCustomElement.attachableMethods.instanceRefs);
        clazz.prototype.__attrocity.init = function(scope) {
            scope.__attrocity.observables.customElement = new ObservableCustomElement(scope, callback);
            scope.__attrocity.isInitialized = true;
        };

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
            this.ignoreNextChange = true;
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
