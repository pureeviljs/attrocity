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
                if (this.__attrocity.getObservable('customelement')._ignoreNextChange
                || !this.__attrocity.getObservable('customelement')._observing ) { return; }
                this.__attrocity.getObservable('customelement').dispatchChange(this, name, newValue, oldValue);

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
        scope.__attrocity.sync('customelement', new ObservableCustomElement(scope, null, scope.constructor.observedAttributes), true, true);
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
        this._observing = false;
    }
}
