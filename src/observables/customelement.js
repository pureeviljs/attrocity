import AbstractObservable from './abstractobservable.js';
import CustomElementBindingManager from '../customelementbindingmanager.js';
import Binding from '../bind.js';

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
                ce.dispatchChange(name, newValue, { oldValue: oldValue, originChain: originchain, scope: ce });
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
            (name, val, { oldValue: old, originChain: originchain, scope: o }) => { scope.__attrocity.originChainContinuity = originchain },
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

        this._observing = true;

        this._rawdata = el;
        this.name = el.tagName;

        const scope = this;
        this._createProxy();

    }

    _setRawValue(key, value) {
        this._rawdata.setAttribute(key, value);
    }

    _getRawValue(key) {
        if (this._rawdata.getAttribute(key)) {
            return this._rawdata.getAttribute(key);
        } else {
            return undefined;
        }
    }

    _setKey(prop, value, originchain) {
        if (!originchain) { originchain = []; }
        originchain.push(this);

        if (this._keyAllowed(prop)) {
            const oldvalue = this._getRawValue(prop);
            this._setRawValue(prop, value);

            Binding.log({action: 'setvalue', key: prop, target: this, origin: originchain });
        }
    }

    /**
     * stop observation
     */
    stop() {
        this._observing = false;
    }
}
