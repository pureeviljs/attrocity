import Reflect from '../../src/reflect.js';

export default class DummyComponentReflection extends HTMLElement {
    static get observedAttributes() {
        return ['test', 'anothertest', 'finaltest'];
    }

    constructor() {
        super();
        this.binding = Reflect.createBindings(this);
    }
}

customElements.define('dummy-component--reflection', Reflect.attach(DummyComponentReflection));