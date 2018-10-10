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
            //if (oldValue === newValue) { return; }
            if (this.__attrocity) {
                if (this.__attrocity.getObservable('customelement')._ignoreNextChange
                || !this.__attrocity.getObservable('customelement')._observing ) { return; }
                this.__attrocity.getObservable('customelement').dispatchChange(this, name, newValue);

                this.__attrocity.getObservable('customelement')._ignoreNextChange = false;
            }
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

        this._element = el;

        const scope = this;
        this._model = new Proxy({}, {
            get: function(target, name) {
                return scope._element.getAttribute(name);
            },
            set: function(target, prop, value) {
                // should this be more resrictive in what allows setting by user pref?
                // observedAttribute list is too limiting i think here
                scope._element.setAttribute(prop, value);
                return true;
            }
        });
    }

    /**
     * stop observation
     */
    stop() {
        this._observing = false;
    }
}
