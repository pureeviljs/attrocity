import Observable from "../../src/observables/customelement.js";

export default class DummyComponentAttributeObserve extends HTMLElement {
    static get observedAttributes() {
        return ['test', 'anothertest'];
    }

    constructor() {
        super();
        this.testvalue = [];
        this.binding = Observable.createBindings(this);
        this.binding.addCallback((name, value) => this.onAttributeChanged(name, value))
    }

    onAttributeChanged(name, value) {
        this.testvalue.push(name, value);
        console.log('---', name, value)
    }
}

customElements.define('dummy-component--attribute-observe', Observable.attach(DummyComponentAttributeObserve) );
