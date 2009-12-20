/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * The purpose of this pretty simple class is to make options for classes easy
 * to handle. This class makes no sense if you use it directly but becomes
 * powerful if you extend an other class with it.
 * 
 * @class Offers a options-property and a setOptions method for convenient
 *        definition and retrieval of options.
 * 
 * @version 0.1
 * @author DracoBlue
 */
Options = function() {
    /**
     * The options object.
     * 
     * You may read a specific option with this.options[key].
     */
    this.options = {};
};

Options.prototype = {
        
    /**
     * This function extends the this.options with those new key-value pairs.
     * Will overwrite existing properties only if the key is the same.
     * 
     * @param {Object}
     *            options The new options.
     */
    setOptions: function(options) {
        this.options = this.options || {};

        if (typeof options === "undefined") {
            return;
        }

        for (option_key in options) {
            this.options[option_key] = options[option_key];
        }
    }
};
