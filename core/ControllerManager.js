/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

ControllerManager = function() {
    this.controllers_string = {};
    this.controllers_regexp = {};
};

ControllerManager.prototype = {
    'addController' : function(path, controller) {

        if (typeof path === "function") {
            /*
             * Handle those pretty regexp objects as path!
             */
            this.controllers_regexp = this.controllers_regexp || [];

            this.controllers_regexp.push( [ path, controller ]);

            return;
        }

        this.controllers_string = this.controllers_string || {};

        if (this.controllers_string[path]) {
            throw new Error("Path already served by " + this.controllers[path]);
        }
        this.controllers_string[path] = controller;
    },

    'getController' : function(path) {
        if (this.controllers_string[path]) {
            return [ this.controllers_string[path], [ path ] ];
        }

        for (i in this.controllers_regexp) {
            var match = String(path).match(this.controllers_regexp[i][0]);
            if (match) {
                return [ this.controllers_regexp[i][1], match ];
            }
        }

        throw new Error("Controller for path " + path + " not found!");
    },

    /**
     * Get all available controllers and load them ... .
     */
    "loadControllers" : function(path) {
        var sys = require('sys');
        var controller_files = [];
        try {
            sys.exec("ls " + path + "controllers/*.js").addCallback(function(stdout, stderr) {
                var files_in_folder = stdout.split("\n");
    
                for (i in files_in_folder) {
                    if (files_in_folder[i] !== "") {
                        controller_files.push(files_in_folder[i]);
                    }
                }
            }).wait();
        } catch (e) {
            /*
             *  controllers folder does not exist!
             */
        }
        
        for (i in controller_files) {
            require(controller_files[i].substr(0, controller_files[i].length - 3));
        }
    }
}
