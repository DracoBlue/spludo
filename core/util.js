/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * Check wether a given element is a function or not.
 *
 * @return {boolean}
 */
process.isFunction = function(element) {
    return (typeof element == "function") ? true : false;
};

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
            cb();
            return ;
        }
    
        if (args_length === 1) {
            cb();
            return ;
        }
        
        var items_left_to_execute = args_length;
        
        var call_group_item = function(arg) {
            arg(function() {
                items_left_to_execute--;
                if (!items_left_to_execute) {
                    cb();
                }
            });
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
                start_func();
            }
        });
    };
    
    start_func();
};


/**
 *
 * @license MIT License from OUI at http://github.com/rsms/oui/blob/master/oui/std-additions.js
 */
GLOBAL.mixin = function(target) {
  var i = 1, length = arguments.length, source;
  for ( ; i < length; i++ ) {
    // Only deal with defined values
    if ( (source = arguments[i]) !== undefined ) {
      Object.getOwnPropertyNames(source).forEach(function(k){
        var d = Object.getOwnPropertyDescriptor(source, k) || {value:source[k]};
        if (d.get) {
          target.__defineGetter__(k, d.get);
          if (d.set) target.__defineSetter__(k, d.set);
        }
        else if (target !== d.value) {
          target[k] = d.value;
        }
      });
    }
  }
  return target;
};
