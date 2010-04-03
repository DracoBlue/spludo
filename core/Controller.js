/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class A simple controller with either String or RegExp-Path
 * 
 * @since 0.1 
 * @author DracoBlue
 */
Controller = function(path, options) {
    if (process.isFunction(options.execute)) {
        this.execute = options.execute;
        delete options.execute;
    }

    if (options.path) {
        throw new Error("The path for a controller cannot be set by using the options hash!");
    }

    this.setOptions(options);
    this.options.path = path;

    controller_manager.addController(path, this);
};

extend(true, Controller.prototype, Options.prototype, Logging.prototype);

Controller.prototype.execute = function() {
    throw new Error("Implement execute-method me!");
};
