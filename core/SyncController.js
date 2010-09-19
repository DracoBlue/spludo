/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class A sync controller with either String or RegExp-Path
 * 
 * @extends Controller
 */
SyncController = function(path, sync_function) {
    var options = [ 
        path, {
            execute: function() {
                var args = arguments;
                return function(cb) {
                    cb(sync_function.apply(this, args));
                };  
           }   
        }   
    ];  
    Controller.prototype.constructor.apply(this, options);
};

extend(true, SyncController.prototype, Controller.prototype);
