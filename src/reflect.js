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
        clazz.prototype.attributeChangedCallback = ObservableCustomElement.attachableMethods.attributeChangedCallback;

        Object.defineProperty(clazz, 'observedAttributes', {
            get: function() { return attributes; }
        });

        if (!bindingGetterName) { bindingGetterName = 'binding'; }
        Object.defineProperty(clazz.prototype, bindingGetterName, {
            get: function() {
                if (!this.__attrocity.isInitialized) {
                    this.__attrocity.init(this);
                }
                return this.__attrocity.observables.customElement;
            }
        });

        Object.defineProperty(clazz.prototype, '__attrocity', ObservableCustomElement.attachableMethods.instanceRefs);

        clazz.prototype.__attrocity.init = function(scope) {
            const obj = {};
            for (let c = 0; c < attributes.length; c++) {
                obj[attributes[c]] = scope.getAttribute(attributes[c]);
                Object.defineProperty(scope, attributes[c], {
                    set: function(val) { return scope.__attrocity.observables.dataModel.setKey(attributes[c], val) },
                    get: function() { return scope.__attrocity.observables.dataModel.getKey(attributes[c]) }
                });
            }

            scope.__attrocity.observables.customElement = new ObservableCustomElement(scope, callback);
            scope.__attrocity.observables.dataModel = new ObservableObject(obj);
            scope.__attrocity.binding = new Bind();
            scope.__attrocity.binding.add(scope.__attrocity.observables.dataModel, true, true);
            scope.__attrocity.binding.add(scope.__attrocity.observables.customElement, true, true);
            scope.__attrocity.isInitialized = true;
        };

        return clazz;
    }

}
