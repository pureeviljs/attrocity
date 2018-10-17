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
                if (this.__attrocity.getObservable('customelement')._ignoreNextChange) { return; }

                this.__attrocity.getObservable('customelement').dispatchChange(this, name, newValue);

                this.__attrocity.getObservable('customelement')._ignoreNextChange = false;
            }
        };
        return clazz;
    }

    static createBindings(scope) {
        const obj = {};
        scope.__attrocity = new CustomElementBindingManager();
        scope.__attrocity.add(new ObservableObject(obj, null, scope.constructor.observedAttributes), Bind.TWOWAY, 'datamodel',);
        scope.__attrocity.add(new ObservableCustomElement(scope, null, scope.constructor.observedAttributes), Bind.TWOWAY, 'customelement');

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
