/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

Options = function() {
};

Options.prototype = {
    'setOptions' : function(options) {
        this.options = this.options || {};
        
        if (typeof options === "undefined") {
            return;
        }
        
        for (option_key in options) {
            this.options[option_key] = options[option_key];
        }
    }
};
