/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * Creates a group of all passed arguments (each of them must be a function)
 * and returns a function, which executes all.
 * 
 * @return function
 */
GLOBAL.group = function () {
    var args = arguments;
    var args_length = args.length;
    
    return function(cb) {
        if (args_length === 0) {
            process.nextTick(cb);
            return ;
        }
    
        var items_left_to_execute = args_length;
        
        var after_group_item = function() {
            items_left_to_execute--;
            if (!items_left_to_execute) {
                process.nextTick(cb);
            }
        };
        
        var call_group_item = function(arg) {
            arg(after_group_item);
        };
    
        for ( var i = 0; i < args_length; i++) {
            call_group_item(args[i]);
        }
    };
};

/**
 * Executes all functions (passed as arguments) in order.
 * 
 * @return
 */
GLOBAL.chain = function () {
    var args = arguments;
    var args_length = args.length;
    
    if (args_length === 0) {
        return ;
    }
    
    var args_pos = 0;

    var start_func = function() {
        args[args_pos](function() {
            args_pos++;
            if (args_length > args_pos) {
                process.nextTick(start_func);
            }
        });
    };
    
    process.nextTick(start_func);
};

/**
 * Adopted from jquery's extend method. Under the terms of MIT License.
 *
 * http://code.jquery.com/jquery-1.4.2.js
 */
GLOBAL.extend = function() {
    // copy reference to target object
    var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;

    // Handle a deep copy situation
    if ( typeof target === "boolean" ) {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if ( typeof target !== "object" && !typeof target === 'function') {
        target = {};
    }

    var isArray = function(obj) {
        return toString.call(copy) === "[object Array]" ? true : false;
    };

    var isPlainObject = function( obj ) {
        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if ( !obj || toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval ) {
            return false;
        }
        
        var has_own_constructor = hasOwnProperty.call(obj, "constructor");
        var has_is_property_of_method = hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf");
        // Not own constructor property must be Object
        if ( obj.constructor && !has_own_constructor && !has_is_property_of_method) {
            return false;
        }
        
        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
    
        var last_key;
        for ( key in obj ) {
            last_key = key;
        }
        
        return typeof last_key === "undefined" || hasOwnProperty.call( obj, last_key );
    };


    for ( ; i < length; i++ ) {
        // Only deal with non-null/undefined values
        if ( (options = arguments[ i ]) !== null ) {
            // Extend the base object
            for ( name in options ) {
                src = target[ name ];
                copy = options[ name ];

                // Prevent never-ending loop
                if ( target === copy ) {
                    continue;
                }

                // Recurse if we're merging object literal values or arrays
                if ( deep && copy && ( isPlainObject(copy) || isArray(copy) ) ) {
                    var clone = src && ( isPlainObject(src) || isArray(src) ) ? src : isArray(copy) ? [] : {};

                    // Never move original objects, clone them
                    target[ name ] = GLOBAL.extend( deep, clone, copy );

                // Don't bring in undefined values
                } else if ( typeof copy !== "undefined" ) {
                    target[ name ] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
};

