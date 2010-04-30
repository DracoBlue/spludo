/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var child_process = require('child_process');

/**
 * @class The manager for all registered views.
 * 
 * @extends Logging
 * 
 * @since 0.1 
 * @author DracoBlue
 */
ViewManager = function() {
    this.views = {};
    
    this.view_engines = [];
};

extend(true, ViewManager.prototype, Logging.prototype);

ViewManager.prototype.addView = function(name, view, module_name) {
    this.views = this.views || {};
    module_name = module_name || this.current_module_name;

    this.info("addView: module:" + module_name + ", name:" + name);

    if (module_name) {
        this.views[module_name + "." + name] = view;
        if (typeof this.views[name] === "undefined") {
            this.views[name] = view;
        }
    } else {
        this.views[name] = view;
    }
};

ViewManager.prototype.getView = function(name, module_name) {
    module_name = module_name || null;

    var view = null;

    if (module_name !== null) {
        view = this.views[module_name + "." + name] || this.views[name];
    } else {
        view = this.views[name] || null;
    }

    if (view === null) {
        throw new Error("View not found for name " + name + " (module: " + (module_name || "") + ")!");
    }

    return view;
};

/**
 * Get all available views and load them ... .
 */
ViewManager.prototype.loadViews = function(path, module_name) {
    var self = this;
    
    this.info("loadViews: module:" + module_name + ", path:" + path);

    var js_bootstrap_token = bootstrap_manager.createMandatoryElement('ViewManager.loadViews+*.js ' + module_name + '/' + path);
    
    try {
        child_process.exec("ls " + path + "views/*.js", function(err, stdout, stderr) {
            var view_files = [];
            
            if (!err) {
                var files_in_folder = stdout.split("\n");
    
                for (i in files_in_folder) {
                    if (files_in_folder[i] !== "") {
                        view_files.push(files_in_folder[i]);
                    }
                }

                self.current_module_name = module_name;
                
                
                for (i in view_files) {
                    require(view_files[i].substr(0, view_files[i].length - 3));
                }
                
                delete self.current_module_name;
            }
            bootstrap_manager.finishMandatoryElement(js_bootstrap_token);
        });
    } catch (e) {
        /*
         * views folder does not exist!
         */
        bootstrap_manager.finishMandatoryElement(js_bootstrap_token);
    }
    
    var view_engines_length = this.view_engines.length;
    for (var i=0; i<view_engines_length; i++) {
        (function(view_engine_options) {
            var file_extension = view_engine_options[0];
            var engine = GLOBAL[view_engine_options[1]];
            
            var mandatory_element_name = 'ViewManager.loadViews+*.' + file_extension + ' ' + module_name + '/' + path;
            var bootstrap_token = bootstrap_manager.createMandatoryElement(mandatory_element_name);
    
            try {
                child_process.exec("ls " + path + "views/*." + file_extension, function(err, stdout, stderr) {
                    var view_files = [];
                    
                    if (!err) {
                        var files_in_folder = stdout.split("\n");
            
                        for (i in files_in_folder) {
                            if (files_in_folder[i] !== "") {
                                view_files.push(files_in_folder[i]);
                            }
                        }
                    }
                    
                    self.current_module_name = module_name;
                    
                    for (i in view_files) {
                        var view_name = view_files[i].substr(path.length + "views/".length);
                        view_name = view_name.substr(0, view_name.length - file_extension.length - 1);
                        
                        new engine(view_name, view_files[i]);
                    }
                    
                    delete self.current_module_name;
                    
                    bootstrap_manager.finishMandatoryElement(bootstrap_token);
                });
            } catch (e) {
                /*
                 * views folder does not exist!
                 */
                bootstrap_manager.finishMandatoryElement(bootstrap_token);
            }
        })(this.view_engines[i]);
    }
};

/**
 * Add a new view engine by file pattern.
 */
ViewManager.prototype.addViewEngine = function(file_pattern, engine_name) {
    this.view_engines.push([
        file_pattern, engine_name
    ]);
};
