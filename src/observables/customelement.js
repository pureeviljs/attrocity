import AbstractObservable from './abstractobservable.js';
import CustomElementBindingManager from '../customelementbindingmanager.js';

export default class ObservableCustomElement extends AbstractObservable {
    /**
     * attach class to web component as a mixin
     * @param clazz
     * @returns {*}
     */
    static attach(clazz) {
        clazz.prototype.attributeChangedCallback = function (name, oldValue, newValue) {
            if (this.__attrocity) {
                if (this.__attrocity.getObservable('customelement').ignoreNextChange
                || !this.__attrocity.getObservable('customelement')._observing ) { return; }
                this.__attrocity.getObservable('customelement').dispatchChange(this, name, newValue);
            }
            this.__attrocity.getObservable('customelement').ignoreNextChange = false;
        };
        return clazz;
    }

    /**
     * create bindings on instance
     * @param scope
     * @param opts
     * @returns {CustomElementBindingManager}
     */
    static createBindings(scope, opts) {
        scope.__attrocity = new CustomElementBindingManager();
        scope.__attrocity.add('customelement', new ObservableCustomElement(scope), true, true);
        return scope.__attrocity;
    }


    /**
     * constructor
     * @param {HTMLElement} el element to watch
     * @param {Function} cb callback
     */
    constructor(el, cb) {
        super(el, cb);
        this._observing = true;
    }

    /**
     * stop observation
     */
    stop() {
        this._observing = false;
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
