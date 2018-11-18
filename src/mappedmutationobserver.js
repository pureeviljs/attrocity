import Convert from './convert.js';

export default class MappedMutationObserver extends MutationObserver {
    static get defaultOptions() {
        return {
            mapKey: 'map'
        }
    }

    constructor(callback) {
        super(e => this.onMutationChange(e));
        this._callback = callback;
    }

    observe(rootEl, objectMapping, opts) {
        if (!opts) { opts = {}; }
        Object.assign(opts, MappedMutationObserver.defaultOptions);
        this._options = opts;
        this._rootElement = rootEl;
        this._objectMapping = objectMapping;
        super.observe(rootEl, { attributes: true, attributeOldValue: true, subtree: true });
        this._data = Convert.fromElements(rootEl, { mapKey: this._options.mapKey, keys: objectMapping });

        let detail = Object.assign({
            rootEl: this._rootElement,
        }, this._options);

        this._callback(this._data, detail);
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
