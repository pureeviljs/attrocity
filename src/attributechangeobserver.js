import Convert from './convert.js';

export default class AttributeChangeObserver extends MutationObserver {
    static get defaultOptions() {
        return {
            mapKey: 'map',
            includeInputValueChanges: true
        }
    }

    constructor(callback) {
        super(e => this.onMutationChange(e));
        this._callback = callback;
        this._inputValueRecord = new WeakMap();
    }

    observe(rootEl, objectMapping, opts) {
        if (!opts) { opts = {}; }
        Object.assign(opts, AttributeChangeObserver.defaultOptions);
        this._options = opts;
        this._rootElement = rootEl;
        this._objectMapping = objectMapping;
        super.observe(rootEl, { attributes: true, attributeOldValue: true, subtree: true });
        this._data = Convert.fromElements(rootEl, { mapKey: this._options.mapKey, keys: objectMapping });

        let detail = Object.assign({
            rootEl: this._rootElement,
        }, this._options);

        if (this._options.includeInputValueChanges) {
            rootEl.addEventListener('change', e => this.onInputValueChanged(e));
        }

        this._callback(this._data, detail);
    }

    /**
     * listen for input value changes since the attribute doesn't reflect
     * @param e
     */
    onInputValueChanged(e) {
        let oldVal;
        if (this._inputValueRecord.has(e.target)) {
            oldVal = this._inputValueRecord.get(e.target);
        } else {
            oldVal = e.target.getAttribute('value');
        }

        if (e.target.hasAttribute(this._options.mapKey)) {
            let detail = Object.assign({
                rootEl: this._rootElement,
                target: e.target,
                attributeName: 'value',
                value: e.target.value,
                oldValue: oldVal,
                targetMapping: e.target.getAttribute(this._options.mapKey),
            }, this._options);

            this._inputValueRecord.set(e.target, e.target.value);
            this._callback(this._data, detail);
        }
    }

    onMutationChange(mRecs) {
        mRecs.forEach(record => {
            if (record.target.hasAttribute(this._options.mapKey)) {
                if (this._objectMapping[record.target.getAttribute(this._options.mapKey)].indexOf(record.attributeName) !== -1) {
                    let detail = Object.assign({
                        rootEl: this._rootElement,
                        target: record.target,
                        attributeName: record.attributeName,
                        value: record.target.getAttribute(record.attributeName),
                        oldValue: record.oldValue,
                        targetMapping: record.target.getAttribute(this._options.mapKey),
                    }, this._options);

                    this._callback(this._data, detail);
                }
            }
        });
    }
}
