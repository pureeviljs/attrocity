import AbstractObservable from './abstractobservable.js';
import Binding from '../bind.js';
import Convert from '../convert.js';
import DotPath from '../dotpath.js';

export default class ObservableElement extends AbstractObservable {
    /**
     * constructor
     * @param {HTMLElement} el element to watch
     * @param {Function} cb callback
     * @param opts
     */
    constructor(el, cb, opts) {
        super(el, cb, opts);

        if (!opts) { opts = {}; }
        this.observer = new MutationObserver(e => this.onMutationChange(e));
        this.observer.observe(el, { attributes: true, attributeOldValue: true, subtree: opts.watchSubtree });

        this.element = el;
        this.name = el.tagName;

        this._parentKey = opts.parentAttribute ? opts.parentAttribute : 'parent';
        this._watchSubtree = opts.watchSubtree ? opts.watchSubtree : false;
        this._rawdata = this._elementsToObject();
        this._createProxy();
    }

    /**
     * create object from local DOM tree
     * @private
     */
    _elementsToObject() {
        const assign = (el, data) => {
            let dotpath = '';
            if (el.hasAttribute(this._parentKey)) {
                dotpath = el.getAttribute(this._parentKey);
            }

            const obj = Convert.fromAttrs(el, { ignore: [ this._parentKey ]});

            const level = DotPath.resolvePath(dotpath, data, { alwaysReturnObject: true, lastSegmentIsObject: true });
            Object.assign(level, obj);
        };

        let data = {};
        assign(this.element, data);
        let els = this.element.querySelectorAll('[' + this._parentKey + ']');
        for (let c = 0; c < els.length; c++) {
            assign(els[c], data);
        }

        return data;
    }

    _setRawValue(target, key, value) {
        super._setRawValue(target, key, value);

        if (this._watchSubtree) {
            const dotpath = DotPath.toPath(this._rawdata, target);
            const els = this.element.querySelectorAll(`[${this._parentKey}="${dotpath}"]`);
            for (let c = 0; c < els.length; c++) {
                els[c].setAttribute(key, value);
            }

            // since root level el isn't in the querySelector, see if we should update
            if (this.element.getAttribute(this._parentKey) === dotpath) {
                this.element.setAttribute(key, value);
            }
        } else {
            this.element.setAttribute(key, value);
        }
    }

    /**
     * stop observation
     */
    stop() {
        super.stop();
        this.observer.disconnect();
    }

    /**
     * mutation change handler
     * @param e
     */
    onMutationChange(e) {
        for (let c = 0; c < e.length; c++) {
            if (this._keyAllowed(e[c].attributeName, e[c].target.attributes)) {
                let dotpath = '';
                if (e[c].target.hasAttribute(this._parentKey)) {
                    dotpath = e[c].target.getAttribute(this._parentKey);
                }
                dotpath = DotPath.appendKeyToPath(dotpath, e[c].attributeName);

                const target = DotPath.resolvePath(dotpath, this._rawdata, { alwaysReturnObject: true });
                super._setRawValue(target, e[c].attributeName, e[c].target.getAttribute(e[c].attributeName));
                this.dispatchChange(
                    e[c].attributeName,
                    e[c].target.getAttribute(e[c].attributeName), {
                        keyPath: dotpath,
                        key: e[c].attributeName,
                        value: e[c].target.getAttribute(e[c].attributeName),
                        oldValue: e[c].oldValue,
                        originChain: [this],
                        target: e[c].target,
                        scope: this._rawdata });
            }
        }
    }
}
