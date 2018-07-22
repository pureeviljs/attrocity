'use strict';

var Convert = {
    /**
     * default ignore list for attributes
     * @returns {string[]}
     */
    get ignore() { return [ 'class' ]; },

    /**
     * default settings for most methods in module
     * @returns {{allowAllAttributes: boolean, typeConvert: boolean, ignore: *}}
     */
    get defaults() {
        return {
            allowAllAttributes: false,
            typeConvert: true,
            ignore: this.ignore
        }
    },

    /**
     * object from element attribtues
     * @param element
     * @param options {
     *          allowAllAttributes: boolean to allow all attributes to come through, default false
     *          typeConvert: boolean to allow conversion of numbers from strings
     *          ignore: Array of attributes to ignore default [class]
     * @return object/dictionary
     */
    fromAttrs(el, opts) {
        opts = Object.assign(this.defaults, opts ? opts : {} );
        const o = {};
        const attributes = el.attributes;
        for (let c = 0; c < attributes.length; c++) {
            if (opts.ignore.indexOf(attributes[c].nodeName) === -1 || opts.allowAllAttributes) {
                let val = attributes[c].nodeValue;
                if (!isNaN(parseFloat(val)) && opts.typeConvert) {
                    val = parseFloat(val);
                }
                o[attributes[c].nodeName] = val;
            }
        }
        return o;
    },

    /**
     * set attributes of an element sourced from an object
     * @param el element to accept object mapping
     * @param obj object to map to element
     * @param options {
     *          allowAllAttributes: boolean to allow all attributes to come through, default false
     *          typeConvert: boolean to allow conversion of numbers from strings
     *          ignore: Array of attributes to ignore default [class]
     * @returns {*} element
     */
    setAttrs(el, obj, opts) {
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
    },

    /**
     * convert to string of attributes (myattr="value" anotherattr="value")
     * @param obj simple flat obj or element
     * @param options {
     *          allowAllAttributes: boolean to allow all attributes to come through, default false
     *          typeConvert: boolean to allow conversion of numbers from strings
     *          ignore: Array of attributes to ignore default [class]
     * @returns {string}
     */
    toAttrString(obj, opts) {
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
};

var MapDOM = {
    /**
     * defaults
     * @returns {{attribute: string, root: string}}
     */
    get defaults() {
        return {
            attribute: 'cache',
            root: 'cacheroot'
        }
    },

    /**
     * generate attribute selector for query selection
     * @param name
     * @returns {string}
     */
    attributeSelector(name) { return '[' + name + ']'; },

    /**
     * map dom elements with desired attribute to object
     * @param node
     * @param opts
     */
    map(node, opts) {
        opts = Object.assign(this.defaults, opts ? opts : {} );
        const selector = this.attributeSelector(opts.attribute);

        let domcache = {};
        let els = node.querySelectorAll(selector);
        let rootlevelEls = node.querySelectorAll(this.attributeSelector(opts.root));

        let nondeepEls = [];
        // weed out selections past the desired root
        for (let e = 0; e < els.length; e++) {
            let elIsContainedByRoot = false;
            for (let d = 0; d < rootlevelEls.length; d++) {
                if (rootlevelEls[d] !== els[e] && rootlevelEls[d].contains(els[e])) {
                    elIsContainedByRoot = true;
                }
            }
            if (!elIsContainedByRoot) {
                nondeepEls.push(els[e]);
            }
        }

        // map to object
        for (let c = 0; c < nondeepEls.length; c++) {
            let props = nondeepEls[c].getAttribute(opts.attribute);
            let level = domcache;
            props = props.split('.');
            props = props.reverse();

            while (props.length > 0) {
                let prop = props.pop();

                if (!level[prop]) {
                    if (props.length === 0) {
                        level[prop] = nondeepEls[c];
                    } else {
                        level[prop] = {};
                    }
                }
                level = level[prop];
            }
        }
        return domcache;
    },
};

var main = {
    Convert: Convert,
    MapDOM: MapDOM
};

module.exports = main;
