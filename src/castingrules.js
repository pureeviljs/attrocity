export default class CastingRules {
    static defaultRule(value) {
        if (value === 'true') { return true; }
        if (value === 'false') { return false; }
        if (!isNaN(Number(value))) { return Number(value); }
        return value;
    }

    constructor() {
        this._rules = new Map();
        this._rules.set('*', [ CastingRules.defaultRule ]);

    }

    addRule(key, rule) {
        if (key === '*') {
            this._rules.get(key).push(rule);
        } else if (Array.isArray(key)) {
            for (let c = 0; c < key.length; c++) {
                this.addRule(key[c], rule );
            }
        } else {
            this._rules.set(key, rule);
        }
    }

    cast(key, value) {
        let val = value;
        const genericRules = this._rules.get('*');
        for (let c = 0; c < genericRules.length; c++) {
            val = genericRules[c](val);
        }

        if (this._rules.has(key)) {
            return this._rules.get(key)(val);
        } else {
            return val;
        }
    }

}