/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

ViewManager = function() {
    this.views = {};
};

ViewManager.prototype = {
    'addView' : function(name, view, module_name) {
        this.views = this.views || {};
        module_name = module_name || this.current_module_name;
        
        if (module_name) {
            this.views[module_name + "." + name ] = view;
            if (typeof this.views[name] === "undefined") {
                this.views[ name ] = view;
            }
        } else {
            this.views[ name ] = view;
        }
    },

    'getView' : function(name, module) {
        var module_name = module_name || null;
        
        var view = null;
        
        if (module_name !== null) {
            view = this.views[ module_name + "." + name ];
        } else {
            view = this.views[name] || null;
        }

        if (view === null) {
            throw new Error("View found for name " + name + " (module: " + (module || "") + ")!");
        }

        return view
    },

    /**
     * Get all available views and load them ... .
     */
    "loadViews" : function(path, module_name) {
        this.current_module_name = module_name;

        var sys = require('sys');
        var view_files = [];
        try {
            sys.exec("ls " + path + "views/*.js").addCallback(function(stdout, stderr) {
                var files_in_folder = stdout.split("\n");
    
                for (i in files_in_folder) {
                    if (files_in_folder[i] !== "") {
                        view_files.push(files_in_folder[i]);
                    }
                }
            }).wait();
        } catch (e) {
            /*
             *  views folder does not exist!
             */
        }
        
        for (i in view_files) {
            require(view_files[i].substr(0, view_files[i].length - 3));
        }

        view_files = [];

        try {
            sys.exec("ls " + path + "views/*.ejs").addCallback(function(stdout, stderr) {
                var files_in_folder = stdout.split("\n");
    
                for (i in files_in_folder) {
                    if (files_in_folder[i] !== "") {
                        view_files.push(files_in_folder[i]);
                    }
                }
            }).wait();
        } catch (e) {
            /*
             *  views folder does not exist!
             */
        }

        for (i in view_files) {
            var view_name = view_files[i].substr(path.length + "views/".length);
            view_name = view_name.substr(0, view_name.length - 4);
            new HtmlView(view_name, view_files[i]);
        }
        delete this.current_module_name;
    }
}
