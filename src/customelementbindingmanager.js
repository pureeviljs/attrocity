import Binding from './bind.js';
import CastingRules from './castingrules.js';

export default class CustomElementBindingManager {
    constructor() {
        this._observables = {};
        this._binding = new Binding();
        this._rules = new CastingRules();
        this._name = ['CustomElementBindingManager'];
    }

    get binding() {
        return this._binding;
    }

    get castingRules() {
        return this._rules;
    }

    get name() {
        return this._name.join('*');
    }

    addRule(key, rule) {
        this._rules.addRule(key, rule);
    }

    addCallback(cb, name) {
        if (!name) {
            this.binding.addCallback((object, name, value, oldvalue, originchain) => {
                if (!originchain) {
                    originchain = [];
                }
                originchain.push(this);
                cb(object, name, this._rules.cast(name, value), oldvalue, originchain);
            });
        } else {
            this.binding.addCallback((object, name, value, oldvalue, originchain) => {
                if (!originchain) {
                    originchain = [];
                }
                originchain.push(this);
                cb(object, name, this._rules.cast(name, value), oldvalue, originchain);
            }, name);
        }
    }

    add(observable, bindingdirection, name) {
        if (!name) {
            name = observable.constructor.name;
        }
        this._observables[name] = observable;
        this._binding.add(observable, bindingdirection);
        this._name.push(observable.name);
        return this._binding;
    }

    sync(observable, bindingdirection, name) {
        if (!name) {
            name = observable.constructor.name;
        }
        this._observables[name] = observable;
        this._binding.sync(observable, bindingdirection);
        this._name.push(observable.name);
        return this._binding;
    }

    getObservable(name) {
        return this._observables[name];
    }
}
