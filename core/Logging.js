/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var sys = require('sys');

var logWithPrefix = function(prefix, args) {
    var message = "null";
    if (args.length > 1) {
        message = sys.inspect(args);
    }
    
    if (args.length === 1) {
        message = (typeof args[0] === "string") ? args[0] : sys.inspect(args[0]);
    }

    sys.debug(prefix + ': ' + message);

}

Logging = function() {};
Logging.prototype = {
    'log' : function() {
        logWithPrefix("LOG ", arguments);
    },
    'info' : function() {
        logWithPrefix("INFO", arguments);
    }
}
