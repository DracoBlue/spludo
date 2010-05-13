/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var sys = require('sys');

/**
 * The purpose of this pretty simple class is to make logging for classes easy
 * to handle. This class makes no sense if you use it directly but becomes
 * powerful if you extend an other class with it.
 * 
 * @class Offers logging facility.
 * 
 * @since 0.1
 * @author DracoBlue
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

(function() {
    var log_configuration = config.get("logging", {
        "level": Logging.LEVEL_WARN
    });
    
    log_configuration.hide_classes = ' ' + (log_configuration.hide_classes || []).join(' ') + ' ';

    /**
     * Logs with a specific prefix. Should not be used directly at all!
     * @private
     */
    var logWithPrefix = function(log_level, log_prefix, args) {
        var message = "null";
        if (log_configuration.hide_classes.indexOf(' ' + log_prefix + ' ') == '-1') {
            if (args.length > 1) {
                message = sys.inspect(args);
            } else if (args.length === 1) {
                message = (typeof args[0] === "string") ? args[0] : sys.inspect(args[0]);
            }
        
            sys.debug(log_level + ' [' + log_prefix + '] : ' + message);
        }
    };
    
    Logging.prototype.logging_prefix = 'Please configure: this.logging_prefix in this class!';
    
    /**
     * Empty function which is just available to allow calling a log method without effect!
     * @private
     */
    var doNotLog = function() {
    };
    
    if (log_configuration.level >= Logging.LEVEL_TRACE) {
        Logging.prototype.trace = function() {
            logWithPrefix("TRACE", this.logging_prefix, arguments);
        };
    } else {
        Logging.prototype.trace = doNotLog;
    }
    
    if (log_configuration.level >= Logging.LEVEL_DEBUG) {
        Logging.prototype.log = function() {
            logWithPrefix("LOG  ", this.logging_prefix, arguments);
        };
        Logging.prototype.debug = function() {
            logWithPrefix("DEBUG", this.logging_prefix, arguments);
        };
    } else {
        Logging.prototype.debug = doNotLog;
        Logging.prototype.log = doNotLog;
    }
    
    if (log_configuration.level >= Logging.LEVEL_INFO) {
        Logging.prototype.info = function() {
            logWithPrefix("INFO ", this.logging_prefix, arguments);
        };
    } else {
        Logging.prototype.info = doNotLog;
    }
    
    if (log_configuration.level >= Logging.LEVEL_WARN) {
        Logging.prototype.warn = function() {
            logWithPrefix("WARN ", this.logging_prefix, arguments);
        };
    } else {
        Logging.prototype.warn = doNotLog;
    }
    
    if (log_configuration.level >= Logging.LEVEL_ERROR) {
        Logging.prototype.error = function() {
            logWithPrefix("ERROR", this.logging_prefix, arguments);
        };
    } else {
        Logging.prototype.error = doNotLog;
    }
    
    if (log_configuration.level >= Logging.LEVEL_FATAL) {
        Logging.prototype.fatal = function() {
            logWithPrefix("FATAL", this.logging_prefix, arguments);
        };
    } else {
        Logging.prototype.fatal = doNotLog;
    }
})();
