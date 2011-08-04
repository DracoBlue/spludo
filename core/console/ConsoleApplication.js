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
 */
ConsoleApplication = function(options) {
    this.setOptions(options);
};

extend(true, ConsoleApplication.prototype, BaseApplication.prototype);

ConsoleApplication.prototype.logging_prefix = 'ConsoleApplication';

var sys = require("sys");
/**
 * Runs the application.
 */
ConsoleApplication.prototype.run = function() {
    var that = this;
    var response = null;

    var finish_handler = function() {
        storage_manager.shutdown()(function() {
            /*
             * We need to call this, because for instance watchFile does not
             * allows the process to exit.
             * @see https://github.com/DracoBlue/spludo/issues/issue/1
             */
            process.exit(0);
        });
    };

    bootstrap_manager.event_emitter.addListener('end', function() {
        try {
            BaseApplication.executePath(that.options["path"])(function (response) {
                if (response !== null) {
                    sys.puts(response);
                }
                finish_handler();
            });
        } catch (e) {
            response = "Error\n" + (e.stack || e.message) + "\n\n";
            response = response + "Arguments: " + sys.inspect(e['arguments']);
            sys.puts(response);
            finish_handler();
        }
    });
};
