/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class Runs the application exactly one time with a given path.
 * 
 * @extends BaseApplication
 * 
 * @param {Object} options Options to specify the behaviour
 * @param {String} options.path The initial path to launch (when {@link ConsoleApplication#run} gets called)
 * 
 * @since 0.1
 * @author DracoBlue
 */
ConsoleApplication = function(options) {
    this.setOptions(options);
};

process.mixin(true, ConsoleApplication.prototype, BaseApplication.prototype);


var sys = require("sys");
/**
 * Runs the application.
 */
ConsoleApplication.prototype.run = function() {
    var sys = require("sys");
    var response = null;

    try {
        BaseApplication.executePath(this.options["path"])(function (response) {
            sys.puts(response);
        });
    } catch (e) {
        sys.puts("Error:\n" + sys.inspect(e));
    }

};
