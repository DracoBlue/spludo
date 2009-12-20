/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

Config = function() {
    this.values = {};
}

Config.prototype = {

    "setValues": function(values) {
        for (k in values) {
            this.values[k] = values[k];
        }
    },

    "get": function(key, default_value) {
        if (typeof this.values[key] === "undefined") {
            return default_value;
        }
        return this.values[key];
    }

}
