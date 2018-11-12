import Convert from './convert.js';
import DotPath from './dotpath.js';
import Bind from './bind.js';
import MapDOM from './mapdom.js';
import CastingRules from './castingrules.js';
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
     * Convert
     * @returns {Convert}
     * @constructor
     */
    static get DotPath() { return DotPath; }

    /**
     * MapDOM
     * @returns {MapDOM}
     * @constructor
     */
    static get MapDOM() { return MapDOM; }

    /**
     * Casting
     * @returns {CastingRules}
     * @constructor
     */
    static get CastingRules() { return CastingRules; }

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
