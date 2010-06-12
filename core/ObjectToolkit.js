/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class A toolkit for convenient functions on javascript objects.
 * 
 * @since 0.1
 * @author DracoBlue
 */
ObjectToolkit = {
    /**
     * This little method expands an object as long as the path needs to be
     * expanded to allow setting a property.
     * 
     * So if you object is something like that:
     * 
     * <pre>
     * a = {
     *     &quot;b&quot;: {}
     * }
     * </pre>
     * 
     * and you want to create
     * 
     * <pre>
     * a = {
     *     &quot;b&quot;: {
     *         &quot;c&quot;: {
     *             &quot;d&quot;: &quot;hallo&quot;
     *         }
     *     }
     * }
     * </pre>
     * 
     * you would just have to use:
     * 
     * <pre>
     * ObjectToolkit.setPathValue(a, &quot;hallo&quot;, [
     *     &quot;b&quot;, &quot;c&quot;, &quot;d&quot;
     * ]);
     * </pre>
     * 
     * @param {Object}
     *            [entity={}] The object to apply the path to.
     * @param {Object|String|Number|null}
     *            value The value to apply to the path
     * @param {Array}
     *            path The path to apply the value to.
     * 
     * @return {Object} The modified (or newly created) object
     */
    setPathValue: function(entity, path, value) {
        return this.rawSetPathValue(entity || {}, path, value, 0, path.length);
    },

    /**
     * This little magic method does the opposite to ObjectToolkit.setPathValue.
     * 
     * @param {Object}
     *            [entity] The object to retrieve the path from.
     * @param {Array}
     *            path The path to retrieve the value from.
     * 
     * @return {Object|String|Number|null} The value or undefined
     */
    getPathValue: function(entity, path) {
        return this.rawGetPathValue(entity || {}, path, 0, path.length);
    },

    /**
     * This magic little method expands an object as long as the path needs to
     * be expanded to allow setting a property.
     * 
     * @private
     * 
     * @param {Object}
     *            [entity={}] The object to apply the path to.
     * @param {Object|String|Number|null}
     *            value The value to apply to the path
     * @param {Array}
     *            path The path to apply the value to.
     * @param {Number}
     *            path_position The position in the path (for performance
     *            reasons)
     * @param {Number}
     *            path_length The lengths of the path (for performance reasons)
     * 
     * @return {Object} The modified (or newly created) object
     */
    rawSetPathValue: function(entity, path, value, path_position, path_length) {
        /*
         * It's the final one, let's set the value and we're done!
         */
        if (path_position + 1 === path_length) {
            entity[path[path_position]] = value;
        } else {
            entity[path[path_position]] = this.rawSetPathValue(entity[path[path_position]] || {}, path, value, path_position + 1,
                    path_length);
        }

        return entity;
    },

    /**
     * This little magic method does the opposite to
     * ObjectToolkit.rawSetPathValue.
     * 
     * @private
     * 
     * @param {Object}
     *            [entity] The object to retrieve the path from.
     * @param {Array}
     *            path The path to retrieve the value from.
     * @param {Number}
     *            path_position The position in the path (for performance
     *            reasons)
     * @param {Number}
     *            path_length The lengths of the path (for performance reasons)
     * 
     * @return {Object|String|Number|null} The value or undefined
     */
    rawGetPathValue: function(entity, path, path_position, path_length) {
        /*
         * It's the final one, let's retrieve the value and we're done!
         */
        if (path_position + 1 === path_length) {
            return entity[path[path_position]];
        }

        if (!entity) {
            return entity;
        }

        return this.rawGetPathValue(entity[path[path_position]], path, path_position + 1, path_length);
    }

};
