import Binding from './bind.js';
import CastingRules from './castingrules.js';

export default class CustomElementBindingManager {
    constructor() {
        this._observables = {};
        this._binding = new Binding();
        this._rules = new CastingRules();
    }

    get binding() {
        return this._binding;
    }

    get castingRules() {
        return this._rules;
    }

    addRule(key, rule) {
        this._rules.addRule(key, rule);
    }

    addCallback(cb, name) {
        if (!name) {
            this.binding.addCallback( (object, name, value) => {
                cb(name, this._rules.cast(name, value));
            });
        } else {
            this.binding.addCallback( (object, name, value) => {
                cb(this._rules.cast(name, value));
            }, name);
        }
    }

    add(name, observable, isSrc, isDest) {
        this._observables[name] = observable;
        this._binding.add(observable, isSrc, isDest);
    }

    getObservable(name) {
        return this._observables[name];
    }
}