import DotPath from "./dotpath.js";

/**
 * Conversion between Objects, Elements, Attributes, and Strings
 */
export default class Convert {
    /**
     * default ignore list for attributes
     * @returns {string[]}
     */
    static get ignore() { return [ 'class' ]; };

    /**
     * default settings for most methods in module
     * @returns {{allowAllAttributes: boolean, typeConvert: boolean, ignore: *}}
     */
    static get defaults() {
        return {
            allowAllAttributes: false,
            typeConvert: true,
            ignore: this.ignore,
            allow: []
        }
    };

    static fromElements(el, opts) {
        const assign = (el, data, opts) => {
            let dotpath = '';
            if (el.hasAttribute(opts.mapKey)) {
                dotpath = el.getAttribute(opts.mapKey);
            }

            let convertopts = {};
            if (opts.keys && Array.isArray(opts.keys)) {
                convertopts.allow = opts.keys;
            }
            else if (opts.keys && typeof opts.keys === 'object') {
                convertopts.allow = opts.keys[dotpath];
            } else {
                convertopts.ignore = opts.mapKey;
            }

            const obj = Convert.fromAttrs(el, convertopts);

            const level = DotPath.resolvePath(dotpath, data, { alwaysReturnObject: true, lastSegmentIsObject: true });
            Object.assign(level, obj);
        };

        let data = {};

        if (el instanceof HTMLElement) { // could be a doc fragment
            assign(el, data);
        }
        let els = el.querySelectorAll('[' + opts.mapKey + ']');
        for (let c = 0; c < els.length; c++) {
            assign(els[c], data, opts);
        }

        return data;
    }

    /**
     * object from element attribtues
     * @param {Object} el element
     * @param {Object} opts options {
     *          allowAllAttributes: boolean to allow all attributes to come through, default false
     *          typeConvert: boolean to allow conversion of numbers from strings
     *          ignore: Array of attributes to ignore default [class]
     * @return object/dictionary
     */
    static fromAttrs(el, opts) {
        opts = Object.assign(this.defaults, opts ? opts : {} );
        if (opts.allow.length > 0) { opts.ignore = []; }

        const o = {};
        const attributes = el.attributes;
        for (let c = 0; c < attributes.length; c++) {
            let allowKey = false;
            if (opts.ignore.length > 0 && (opts.ignore.indexOf(attributes[c].nodeName) === -1 || opts.allowAllAttributes)) {
                allowKey = true;
            } else if (opts.allow.length > 0 && opts.allow.indexOf(attributes[c].nodeName) !== -1) {
                allowKey = true;
            }

            if (allowKey) {
                let val = attributes[c].nodeValue;
                if (!isNaN(parseFloat(val)) && opts.typeConvert) {
                    val = parseFloat(val);
                }
                o[attributes[c].nodeName] = val;
            }
        }
        return o;
    };

    /**
     * set attributes of an element sourced from an object
     * @param {Object} el element to accept object mapping
     * @param {Object} obj object to map to element
     * @param {Object} opts options {
     *          allowAllAttributes: boolean to allow all attributes to come through, default false
     *          typeConvert: boolean to allow conversion of numbers from strings
     *          ignore: Array of attributes to ignore default [class]
     * @returns {*} element
     */
    static setAttrs(el, obj, opts) {
        opts = Object.assign(this.defaults, opts ? opts : {} );
        if (obj instanceof Element) {
            obj = this.fromAttrs(obj, opts);
        }
        const keys = Object.keys(obj);
        for (let c = 0; c < keys.length; c++) {
            if (opts.ignore.indexOf(keys[c]) === -1 || opts.allowAllAttributes) {
                if (typeof obj[keys[c]] === 'string' || typeof obj[keys[c]] === 'number') {
                    el.setAttribute(keys[c], obj[keys[c]]);
                }
            }
        }
        return el;
    };

    /**
     * convert to string of attributes (myattr="value" anotherattr="value")
     * @param {Object} obj simple flat obj or element
     * @param {Object} opts options {
     *          allowAllAttributes: boolean to allow all attributes to come through, default false
     *          typeConvert: boolean to allow conversion of numbers from strings
     *          ignore: Array of attributes to ignore default [class]
     * @returns {string}
     */
    static toAttrString(obj, opts) {
        opts = Object.assign(this.defaults, opts ? opts : {} );

        if (obj instanceof Element) {
            obj = this.fromAttrs(obj, opts);
        }

        const keys = Object.keys(obj);
        let str = '';
        for (let c = 0; c < keys.length; c++) {
            if (opts.ignore.indexOf(keys[c]) === -1 || opts.allowAllAttributes) {
                if (typeof obj[keys[c]] === 'string' || typeof obj[keys[c]] === 'number') {
                    str += keys[c] + '="' + obj[keys[c]] + '" ';
                }
            }
        }
        return str.trimRight();
    }
}
