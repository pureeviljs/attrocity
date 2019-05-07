(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.Attrocity = {})));
}(this, (function (exports) { 'use strict';

    class Map {
        /**
         * defaults
         * @returns {{attribute: string, root: string}}
         */
        static get mapdefaults() {
            return {
                attribute: 'map',
                root: 'maproot'
            }
        };

        /**
         * defaults
         * @returns {{attribute: string, root: string}}
         */
        static get wiredefaults() {
            return {
                attribute: 'wire',
                root: 'maproot'
            }
        };

        /**
         * generate attribute selector for query selection
         * @param name
         * @returns {string}
         */
        static _attributeSelector(name) { return '[' + name + ']'; };

        /**
         * map dom elements with desired attribute to object
         * @param node
         * @param startingObj
         * @param opts
         */
        static map(node, startingObj, opts) {
            opts = Object.assign(this.mapdefaults, opts ? opts : {} );
            const selector = this._attributeSelector(opts.attribute);

            let domcache = startingObj ? startingObj : {};
            let els = node.querySelectorAll(selector);
            let rootlevelEls = node.querySelectorAll(this._attributeSelector(opts.root));

            els = this._filterElementsContainedByRoot(els, rootlevelEls);

            for (let e = 0; e < els.length; e++) {
                let path = els[e].getAttribute(opts.attribute).split('.');
                const prop = path.pop();
                const deepref = this._ensurePropertyPath(domcache, path);
                this._setProperty(deepref, prop, els[e]);

            }
            return domcache;
        };

        static wire(node, callback, scope, opts) {
            opts = Object.assign(this.wiredefaults, opts ? opts : {} );
            const selector = this._attributeSelector(opts.attribute);
            let els = node.querySelectorAll(selector);
            let rootlevelEls = node.querySelectorAll(this._attributeSelector(opts.root));

            els = this._filterElementsContainedByRoot(els, rootlevelEls);
            for (let e = 0; e < els.length; e++) {
                const eventtypes = els[e].getAttribute(opts.attribute).split(',');
                for (let c = 0; c < eventtypes.length; c++) {
                    els[e].addEventListener(eventtypes[c], e => { callback.apply(scope, [e]); });
                }
            }
        }

        static wireElements(els, events, callback, scope) {
            if (!Array.isArray(els)) {
                els =  [els];
            }
            let eventtypes = events;
            if (!Array.isArray(events)) {
                eventtypes = eventtypes.split(',');
            }
            for (let d = 0; d < els.length; d++) {
                for (let c = 0; c < eventtypes.length; c++) {
                    els[d].addEventListener(eventtypes[c].trim(), e => { callback.apply(scope, [e]); });
                }
            }
        }

        /**
         * ensure deep or shallow path exists on object
         * @param obj
         * @param propslist
         * @return deep reference
         */
        static _ensurePropertyPath(obj, propslist) {
            propslist = propslist.reverse();
            let parent;
            let parentProp;
            while (propslist.length > 0) {
                const prop = propslist.pop();
                if (!obj[prop]) {
                    obj[prop] = {};
                }
                parent = obj;
                obj = obj[prop];
                parentProp = prop;
            }
            return { current: obj, parent: parent, parentProp: parentProp };
        }

        /**
         * set property on object
         * @param obj
         * @param prop
         * @param val
         * @private
         */
        static _setProperty(obj, prop, val) {
            let ref = obj.current;
            let parent = obj.parent;
            let parentProp = obj.parentProp;
            if (!ref[prop]) {
                // element already set on prop, but we're adding more key/values to it as an object
                // roll back to parent and set object that can hold all
                if (ref instanceof Element) {
                    parent[parentProp] = {};
                    parent[parentProp][parentProp] = ref;
                    parent[parentProp][prop] = val;
                } else {
                    ref[prop] = val;
                }
            } else if (ref[prop] instanceof Element) {
                // element already exists on key, turn into array holding list
                ref[prop] = [ ref[prop] ];
                ref[prop].push(val);
            } else if (Array.isArray(ref[prop])) {
                ref[prop].push(val);
            } else if (Object.keys(ref[prop]).length > 0) {
                // key being set is already an object containing keys, bump this key further down the chain
                ref[prop][prop] = val;
            }
        }

        /**
         * remove elements contained by marked roots
         * @param els
         * @param roots
         * @returns {Array}
         */
        static _filterElementsContainedByRoot(els, roots) {
            const nondeepEls = [];
            for (let e = 0; e < els.length; e++) {
                let elIsContainedByRoot = false;
                for (let d = 0; d < roots.length; d++) {
                    if (roots[d] !== els[e] && roots[d].contains(els[e])) {
                        elIsContainedByRoot = true;
                    }
                }
                if (!elIsContainedByRoot) {
                    nondeepEls.push(els[e]);
                }
            }
            return nondeepEls;
        }
    }

    class Reflect {
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
                };
            } else {
                console.warn( clazz.constructor, 'No attributes for reflection specified in the observedAttributes static getter');
            }
            return clazz;
        }
    }

    exports.Map = Map;
    exports.Reflect = Reflect;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=attrocity.js.map
