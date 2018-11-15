/**
 * Conversion between Dot path notation and objects
 */
export default class DotPath {
    static getKeysAtLevel(level) {
        return Object.keys(level);
    }

    /**
     * level has children
     * @param level
     */
    static isParent(level) {
        if (typeof level === 'object') {
            return true;
        } else {
            return false;
        }
    }

    /**
     * is a key/value pair and not a parent
     * @param level
     * @returns {boolean}
     */
    static isValue(level) {
        if (typeof level !== 'object' || level === null) {
            return true;
        } else {
            return false;
        }
    }

    static appendKeyToPath(path, key) {
        let p = path + '.' + key;
        if (p.charAt(0) === '.') {
            p = p.substr(1, p.length);
        }
        return p;
    }

    static toPath(root, target) {
        return DotPath.toPathArray(root, target).join('.');
    }

    /**
     * get dot path notation from object
     * @param root
     * @param target
     * @param dotpath
     * @returns {*}
     */
    static toPathArray(root, target, path) {
        if (path === undefined) {
            path = [];
        }
        if (root === target) {
            return path;
        }
        const keys = DotPath.getKeysAtLevel(root);
        for (let key in keys) {
            const k = keys[key];
            if (DotPath.isParent(root[k])) {
                const p = DotPath.toPathArray(root[k], target, [k]);
                if (p) {
                    return path.concat(DotPath.toPathArray(root[k], target, [k]));
                }
            } else if (root[k] === target) {
                return path.concat([k]);
            }
        }
    }

    /**
     * resolve dot path from object
     * Adapted from:
     * Credit: https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
     * https://stackoverflow.com/users/6782/alnitak
     * @param s
     * @param o
     * @param {boolean} objects only
     * @returns {*}
     */
    static resolvePath(s, o, opts) {
        if (!opts) { opts = {}; }
        if (s === '') { return o; }
        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, '');           // strip a leading dot
        var a = s.split('.');
        for (var i = 0, n = a.length; i < n; ++i) {
            var k = a[i];
            if (DotPath.isParent(o) && k in o) {
                if (opts.alwaysReturnObject && DotPath.isValue(o[k])) {
                    //nothing
                } else {
                    o = o[k];
                }
            } else if (DotPath.isParent(o)) { // o is not in k, create the object
                // exit at current level, we got this far and it only can lead here
                if (i === n-1 && !opts.lastSegmentIsObject) {
                    // end of the line, we didn't find the last path seg, just return so far
                    return o;
                } else {
                    o[k] = {}; // keep going, we didn't find this path seg, so need to create
                    o = o[k];
                }
            }
        }
        return o;
    }
}
