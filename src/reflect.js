export default class Reflect {
    static attach(clazz, changeCallbackFnName) {
        if (!changeCallbackFnName) {
            changeCallbackFnName = 'propertyChangedCallback';
        }
        const props = clazz.observedAttributes;
        if (props) {
            for (let c = 0; c < props.length; c++) {
                Object.defineProperty(clazz.prototype, props[c], {
                    set: function (val) {
                        const old = this.getAttribute(props[c]);
                        this.setAttribute(props[c], val);
                        if (this[changeCallbackFnName]) {
                            this[changeCallbackFnName](props[c], old, val);
                        }
                    },

                    get: function () {
                        return this.getAttribute(props[c]);
                    }
                });
            }

            clazz.prototype.attributeChangedCallback = function(name, oldval, newval) {
                this[changeCallbackFnName](name, oldval, newval);
            }
        } else {
            console.warn( clazz.constructor, 'No attributes for reflection specified in the observedAttributes static getter')
        }
        return clazz;
    }
}
