/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class The configuration.
 * 
 * @since 0.1
 * @author DracoBlue
 */
Config = function() {
    this.values = {};
};

Config.prototype.setValues = function(values) {
    for (k in values) {
        this.values[k] = values[k];
    }
};

Config.prototype.get = function(key, default_value) {
    if (typeof this.values[key] === "undefined") {
        return default_value;
    }
    return this.values[key];
};

/**
 * This method expands the configuration object as long as the path needs to be
 * expanded to allow setting a property.
 * 
 * @param {Array}
 *            path The path to apply the value to.
 * @param {Object|String|Number|null}
 *            value The value to apply to the path
 * 
 * @return {Object} The modified (or newly created) object
 */
Config.prototype.setPathValue = function(path, value) {
    return ObjectToolkit.setPathValue(this.values, path, value);
};

/**
 * This method does the opposite to Config#setPathValue.
 * 
 * @param {Array}
 *            path The path to retrieve the value from.
 * @param {Object|String|Number|null}
 *            [value=undefined] The value to return in case the value is
 *            undefined
 * 
 * @return {Object|String|Number|null} The value or undefined
 */
Config.prototype.getPathValue = function(path, default_value) {
    var value = ObjectToolkit.getPathValue(this.values, path);
    if (typeof value === "undefined") {
        return default_value;
    }
    return value;
};