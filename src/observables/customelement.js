import AbstractObservable from './abstractobservable.js';
import CustomElementBindingManager from '../customelementbindingmanager.js';
import Binding from '../bind.js';
import Convert from '../convert.js';
import DotPath from "../dotpath.js";

export default class ObservableCustomElement extends AbstractObservable {
    /**
     * attach class to web component as a mixin
     * @param clazz
     * @returns {*}
     */
    static attach(clazz) {
        clazz.prototype.attributeChangedCallback = function (name, oldValue, newValue) {
            if (this.__attrocity) {
                let originchain = [];
                if (this.__attrocity.originChainContinuity) {
                    originchain = this.__attrocity.originChainContinuity;
                }

                this.__attrocity.originChainContinuity = [];
                if (!this.__attrocity.getObservable('customelement')._observing ) { return; }
                const ce = this.__attrocity.getObservable('customelement');
                ce.dispatchChange(name, newValue, {
                    keyPath: name,
                    key: name,
                    value: newValue,
                    oldValue: oldValue,
                    target: this.__attrocity.getObservable('customelement').element,
                    originChain: originchain,
                    scope: ce });
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
        scope.__attrocity.sync(new ObservableCustomElement(scope,
            (name, val, details) => { scope.__attrocity.originChainContinuity = details.originchain },
            scope.constructor.observedAttributes),
            Binding.TWOWAY, 'customelement');
        return scope.__attrocity;
    }


    /**
     * constructor
     * @param {HTMLElement} el element to watch
     * @param {Function} cb callback
     */
    constructor(el, cb) {
        super(el, cb, el.constructor.observedAttributes);

        this.element = el;
        this._rawdata = el;
        this.name = el.tagName;

        const scope = this;
        this._rawdata = this._elementsToObject();
        this._createProxy();

    }

    /**
     * create object from local DOM tree
     * @private
     */
    _elementsToObject() {
        let data = {};
        Object.assign(data, Convert.fromAttrs(this.element));
        return data;
    }

    _setRawValue(target, key, value) {
        super._setRawValue(target, key, value);
        this.element.setAttribute(key, value);
    }
}
