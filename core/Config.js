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
