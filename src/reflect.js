import ObservableCustomElement from './observables/customelement.js';
import CustomElementBindingManager from './customelementbindingmanager.js';
import ObservableObject from "./observables/object.js";
import Bind from './bind.js';

export default class Reflect {
    /**
     * attach class to web component as a mixin
     * @param clazz
     * @param attributes
     * @param opts
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
                const ce = this.__attrocity.getObservable('customelement');
                ce.dispatchChange(name, newValue, { oldValue: oldValue, originChain: originchain, scope: ce });
            }
        };
        return clazz;
    }

    static createBindings(scope) {
        const obj = {};
        scope.__attrocity = new CustomElementBindingManager();

        const oo = new ObservableObject(obj,
            (o, name, val, old, originchain) => { scope.__attrocity.originChainContinuity = originchain },
            scope.constructor.observedAttributes,
            scope.tagName + '-backingobject');
        scope.__attrocity.sync(oo, Bind.TWOWAY, 'datamodel');

        const ce = new ObservableCustomElement(scope);
        scope.__attrocity.sync(ce, Bind.TWOWAY, 'customelement');

        const attributes = scope.constructor.observedAttributes;
        if (attributes) {
            for (let c = 0; c < attributes.length; c++) {
                obj[attributes[c]] = scope.getAttribute(attributes[c]);
                Object.defineProperty(scope, attributes[c], {
                    set: function(val) {
                        return scope.__attrocity.getObservable('datamodel').data[attributes[c]] = val;
                    },
                    get: function() {
                        let val = scope.__attrocity.getObservable('datamodel').data[attributes[c]];
                        if (scope.__attrocity.castingRules) {
                            val = scope.__attrocity.castingRules.cast(attributes[c], val);
                        }
                        return val;
                    }
                });
            }
        } else {
            console.warn('No observedAttributes specified for class', scope.constructor);
        }

        return scope.__attrocity;
    }

}
