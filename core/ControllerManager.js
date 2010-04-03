/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var sys = require("sys");

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

ControllerManager.prototype.addController = function(path, controller) {
    var module_name = this.current_module_name || null;

    if (typeof path === "function") {
        /*
         * Handle those pretty regexp objects as path!
         */
        this.info("addController: type:RegExp, module:" + module_name + ", path:" + path);
        this.controllers_regexp = this.controllers_regexp || [];

        this.controllers_regexp.push( [ path, controller, module_name ]);

        return;
    }

    this.controllers_string = this.controllers_string || {};

    if (this.controllers_string[path]) {
        throw new Error("Path already served by " + this.controllers[path]);
    }

    this.info("addController: type:String, module:" + module_name + ", path:" + path);
    this.controllers_string[path] = [ controller, module_name ];
};

ControllerManager.prototype.getController = function(path) {
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
ControllerManager.prototype.loadControllers = function(path, module_name) {
    var self = this;

    this.info("loadControllers: module:" + module_name + ", path:" + path);

    var bootstrap_token = bootstrap_manager.createMandatoryElement('ControllerManager.loadControllers ' + module_name + '/' + path);
    var controller_files = [];
    try {
        sys.exec("ls " + path + "controllers/*.js", function(err, stdout, stderr) {
            var files_in_folder = stdout.split("\n");
            self.log(arguments);
            for (i in files_in_folder) {
                if (files_in_folder[i] !== "") {
                    controller_files.push(files_in_folder[i]);
                }
            }
            
            self.current_module_name = module_name;

            for (i in controller_files) {
                require(controller_files[i].substr(0, controller_files[i].length - 3));
            }
    
            delete self.current_module_name;
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

