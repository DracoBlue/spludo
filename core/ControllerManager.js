/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var child_process = require("child_process");

/**
 * @class The manager for all registered controllers.
 * 
 * @extends Logging
 * 
 * @since 0.1 
 * @author DracoBlue
 */
ControllerManager = function() {
    this.controllers_string = {};
    this.controllers_regexp = [];
};

extend(true, ControllerManager.prototype, Logging.prototype);

ControllerManager.prototype.logging_prefix = 'ControllerManager';

ControllerManager.prototype.addController = function(path, controller) {
    this.trace("addController", arguments);
    var plugin_name = this.current_plugin_name || null;

    if (typeof path === "function") {
        /*
         * Handle those pretty regexp objects as path!
         */
        this.debug("addController", "type:RegExp, plugin:" + plugin_name + ", path:" + path);
        this.controllers_regexp = this.controllers_regexp || [];

        this.controllers_regexp.push( [ path, controller, plugin_name ]);

        return;
    }

    this.controllers_string = this.controllers_string || {};

    if (this.controllers_string[path]) {
        throw new Error("Path already served by " + this.controllers[path]);
    }

    this.debug("addController", "type:String, plugin:" + plugin_name + ", path:" + path);
    this.controllers_string[path] = [ controller, plugin_name ];
};

ControllerManager.prototype.getController = function(path) {
    this.trace("getController", arguments);
    if (this.controllers_string[path]) {
        return [ this.controllers_string[path][0], [ path ], this.controllers_string[path][1] ];
    }

    for (i in this.controllers_regexp) {
        var match = String(path).match(this.controllers_regexp[i][0]);
        if (match) {
            return [ this.controllers_regexp[i][1], match, this.controllers_regexp[i][2] ];
        }
    }

    throw new Error("Controller for path " + path + " not found!");
};

/**
 * Get all available controllers and load them ... .
 */
ControllerManager.prototype.loadControllers = function(path, plugin_name) {
    this.trace("loadControllers", arguments);
    var self = this;
    
    var bootstrap_token_name = "controllers";
    
    if (plugin_name) {
        bootstrap_token_name = "plugin." + plugin_name + '.controllers';
    }

    var bootstrap_token = bootstrap_manager.createMandatoryElement(bootstrap_token_name);
    var controller_files = [];
    try {
        child_process.exec("ls " + path + "controllers/*.js", function(err, stdout, stderr) {
            var files_in_folder = stdout.split("\n");
            for (i in files_in_folder) {
                if (files_in_folder[i] !== "") {
                    controller_files.push(files_in_folder[i]);
                }
            }
            
            self.current_plugin_name = plugin_name;

            for (i in controller_files) {
                require(controller_files[i].substr(0, controller_files[i].length - 3));
            }
    
            delete self.current_plugin_name;
        });
        bootstrap_manager.finishMandatoryElement(bootstrap_token);
    } catch (e) {
        /*
         * controllers folder does not exist!
         */
        this.log(e);
        bootstrap_manager.finishMandatoryElement(bootstrap_token);
    }


};

