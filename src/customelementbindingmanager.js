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

    add(observable, bindingdirection, name) {
        if (!name) {
            name = observable.constructor.name;
        }
        this._observables[name] = observable;
        this._binding.add(observable, bindingdirection);
        return this._binding;
    }

    sync(observable, bindingdirection, name) {
        if (!name) {
            name = observable.constructor.name;
        }
        this._observables[name] = observable;
        this._binding.sync(observable, bindingdirection);
        return this._binding;
    }

    getObservable(name) {
        return this._observables[name];
    }
}
