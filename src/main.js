import Convert from './convert.js';
import MapDOM from './mapdom.js';
import ObservableAttributes from "./observables/element.js";
import ObservableObject from "./observables/object.js";

export default class Main {

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
            Object: ObservableObject
        }
    }
}
