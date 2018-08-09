import ObservableCustomElement from "./observables/customelement.js";
import ObservableObject from "./observables/object.js";
import Bind from "./bind.js";

export default class Reflect {
    /**
     * attach class to web component as a mixin
     * @param clazz
     * @param attributes
     * @param callback
     * @param bindingGetterName
     * @returns {*}
     */
    static attach(clazz, attributes, callback, bindingGetterName) {
        clazz.prototype.attributeChangedCallback = function(name, oldValue, newValue) {
            this.__$instantiateBindings$();

            if (this.__$bindings$._ignoreNextChange) {
                return;
            }
            //this.__$bindings$.dispatchChange(this, name, newValue);
        };

        Object.defineProperty(clazz, 'observedAttributes', {
            get: function() { return attributes; }
        });

        clazz.prototype.__$instantiateBindings$ = function() {
            if (!this.__$bindings$) {
                this.__$bindings$ = {};
                this.__$bindings$.customElement = new ObservableCustomElement(this, callback);
                const obj = {};
                for (let c = 0; c < attributes.length; c++) {
                    obj[attributes[c]] = this.getAttribute(attributes[c]);
                    Object.defineProperty(this, attributes[c], {
                        set: function(val) { return this.__$bindings$.dataModel.setKey(attributes[c], val) },
                        get: function() { return this.__$bindings$.dataModel.getKey(attributes[c]) }
                    });
                }
                this.__$bindings$.dataModel = new ObservableObject(obj);
                this.__$bindings$.binding = new Bind();
                this.__$bindings$.binding.add(this.__$bindings$.dataModel, true, true);
                this.__$bindings$.binding.add(this.__$bindings$.customElement, true, true);
            }
        };

        if (!bindingGetterName) {
            bindingGetterName = 'bindings';
        }

        Object.defineProperty(clazz.prototype, bindingGetterName, {
            get: function() {
                this.__$instantiateBindings$();
                return this.__$bindings$;
            }
        });

        return clazz;
    }

}
