/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var sys = require('sys');

Logging = function() {};
Logging.prototype = {
    'log' : function() {
        sys.debug("LOG : " + sys.inspect(arguments));
    },
    'info' : function() {
        sys.debug("INFO: " + sys.inspect(arguments));
    }
}
