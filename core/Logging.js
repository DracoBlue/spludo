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
};

var doNotLog = function() {
};

/*
 * Log Levels:
 *  * < 6 < 5 < 4 < 3 < 2 < 1 < 0 ALL < TRACE < DEBUG/LOG < INFO < WARN < ERROR <
 * FATAL < OFF
 */

Logging = function() {
};

Logging.LEVEL_ALL = 127;
Logging.LEVEL_TRACE = 6;
Logging.LEVEL_LOG = 5;
Logging.LEVEL_DEBUG = 5;
Logging.LEVEL_INFO = 4;
Logging.LEVEL_WARN = 3;
Logging.LEVEL_ERROR = 2;
Logging.LEVEL_FATAL = 1;
Logging.LEVEL_OFF = 0;

var log_configuration = config.get("logging", {
    "level" : Logging.LEVEL_WARN
});

if (log_configuration.level >= Logging.LEVEL_TRACE) {
    Logging.prototype.trace = function() {
        logWithPrefix("TRACE", arguments);
    };
} else {
    Logging.prototype.trace = doNotLog;
}

if (log_configuration.level >= Logging.LEVEL_DEBUG) {
    Logging.prototype.log = function() {
        logWithPrefix("LOG  ", arguments);
    };
    Logging.prototype.debug = function() {
        logWithPrefix("DEBUG", arguments);
    };
} else {
    Logging.prototype.debug = doNotLog;
    Logging.prototype.log = doNotLog;
}

if (log_configuration.level >= Logging.LEVEL_INFO) {
    Logging.prototype.info = function() {
        logWithPrefix("INFO ", arguments);
    };
} else {
    Logging.prototype.info = doNotLog;
}

if (log_configuration.level >= Logging.LEVEL_WARN) {
    Logging.prototype.warn = function() {
        logWithPrefix("WARN ", arguments);
    };
} else {
    Logging.prototype.warn = doNotLog;
}

if (log_configuration.level >= Logging.LEVEL_ERROR) {
    Logging.prototype.error = function() {
        logWithPrefix("ERROR", arguments);
    };
} else {
    Logging.prototype.error = doNotLog;
}

if (log_configuration.level >= Logging.LEVEL_FATAL) {
    Logging.prototype.fatal = function() {
        logWithPrefix("FATAL", arguments);
    };
} else {
    Logging.prototype.fatal = doNotLog;
}
