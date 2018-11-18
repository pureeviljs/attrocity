export default class Reflect {
    static createBindings(scope) {
        const attributes = scope.constructor.observedAttributes;
        if (attributes) {
            for (let c = 0; c < attributes.length; c++) {
                Object.defineProperty(scope, attributes[c], {
                    set: function(val) {
                        const old = this.getAttribute(attributes[c]);
                        this.setAttribute(attributes[c], val);
                        if (this.attributeChangedCallback) {
                            this.attributeChangedCallback(attributes[c], old, val);
                        }
                    },
                    get: function() {
                        return this.getAttribute(attributes[c]);
                    }
                });
            }
        } else {
            console.warn('No observedAttributes specified for class', scope.constructor);
        }
    }
}
