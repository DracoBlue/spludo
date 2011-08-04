/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

new Validator("string", {
    "execute": function (parameter, options) {
    
        return function(cb) {
            var errors = [];
    
            if (typeof options.max !== "undefined") {
                if (parameter.length > options.max) {
                    errors.push("max");
                }
            }
            
            if (typeof options.min !== "undefined") {
                if (parameter.length < options.min) {
                    errors.push("min");
                }
            }
    
            cb(errors);
        };
    }
});

new Validator("number", {
    "execute": function (parameter, options) {
        return function(cb) {
            var errors = [];
            
            var num_parameter = 0;
    
            try {
                num_parameter = parseInt(parameter, 10);
            } catch (e) {
                errors.push("type");
                cb(errors);
                return ;
            }
    
            if (String(num_parameter) !== String(parameter)) {
                errors.push("type");
                cb(errors);
                return ;
            }
    
            if (typeof options.max !== "undefined") {
                if (num_parameter > options.max) {
                    errors.push("max");
                }
            }
    
            if (typeof options.min !== "undefined") {
                if (num_parameter < options.min) {
                    errors.push("min");
                }
            }
    
            cb(errors);
        };
    }
});

new Validator("array", {
    "execute": function (parameter, options) {
        return function(cb) {
            var errors = [];
            
            if (typeof parameter.join !== "function") {
                errors.push("type");
                cb(errors);
                return ;
            }
    
            cb(errors);
        };
    }
});
