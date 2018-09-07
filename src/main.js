import Convert from './convert.js';
import Bind from './bind.js';
import MapDOM from './mapdom.js';
import ObservableElement from './observables/element.js';
import ObservableObject from './observables/object.js';
import ObservableCustomElement from './observables/customelement.js';

export default class Main {
    /**
     * Bind
     * @returns {Convert}
     * @constructor
     */
    static get Bind() { return Bind; }

    /**
     * Convert
     * @returns {Convert}
     * @constructor
     */
    static get Convert() { return Convert; }

    /**
     * MapDOM
     * @returns {MapDOM}
     * @constructor
     */
    static get MapDOM() { return MapDOM; }

    /**
     * Observables
     * @returns {{Element: ObservableElement, Object: ObservableObject}}
     * @constructor
     */
    static get Observables() {
        return {
            Element: ObservableElement,
            CustomElement: ObservableCustomElement,
            Object: ObservableObject
        }
    }
}
