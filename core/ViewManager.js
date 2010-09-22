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
 */
ViewManager = function() {
    this.views = {};
    
    this.view_engines = [];
};

extend(true, ViewManager.prototype, Logging.prototype);

ViewManager.prototype.logging_prefix = 'ViewManager';

ViewManager.prototype.addView = function(name, view, plugin_name) {
    this.trace('addView', arguments);
    this.views = this.views || {};
    plugin_name = plugin_name || this.current_plugin_name;

    if (plugin_name) {
        this.views[plugin_name + "." + name] = view;
        if (typeof this.views[name] === "undefined") {
            this.views[name] = view;
        }
    } else {
        this.views[name] = view;
    }
};

ViewManager.prototype.getView = function(name, plugin_name) {
    this.trace('getView', arguments);
    plugin_name = plugin_name || null;

    var view = null;

    if (plugin_name !== null) {
        view = this.views[plugin_name + "." + name] || this.views[name];
    } else {
        view = this.views[name] || null;
    }

    if (view === null) {
        throw new Error("View not found for name " + name + " (plugin: " + (plugin_name || "") + ")!");
    }

    return view;
};

/**
 * Get all available views and load them ... .
 */
ViewManager.prototype.loadViews = function(path, plugin_name) {
    this.trace('loadViews', arguments);
    var self = this;
    
    var bootstrap_token_name = "views";
    
    if (plugin_name) {
        bootstrap_token_name = "plugin." + plugin_name + '.views';
    }

    var views_bootstrap_token = bootstrap_manager.createMandatoryElement(bootstrap_token_name);
    var views_bootstrap_parts = [];
    
    var js_bootstrap_token_name = bootstrap_token_name + '.js';
    views_bootstrap_parts.push(js_bootstrap_token_name);
    
    var js_bootstrap_token = bootstrap_manager.createMandatoryElement(js_bootstrap_token_name);
    
    try {
        this.debug('loadViews',"loading views for file extension: js");
        child_process.exec("cd " + path + "views && find . -name '*.js'", function(err, stdout, stderr) {
            var view_files = [];
            
            if (!err) {
                var files_in_folder = stdout.split("\n");
    
                for (i in files_in_folder) {
                    for (i in files_in_folder) {
                        var file = files_in_folder[i].substr(2);
                        if (file !== "") {
                            view_files.push(file);
                        }
                    }
                }

                self.current_plugin_name = plugin_name;
                
                
                for (i in view_files) {
                    var view_file_name = view_files[i];
                    require(path + 'views/' + view_file_name);
                }
                
                delete self.current_plugin_name;
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
            self.debug('loadViews',"loading views for file extension: " + file_extension);
            var engine = GLOBAL[view_engine_options[1]];
            
            var part_bootstrap_token_name = bootstrap_token_name + '.' + file_extension;
            views_bootstrap_parts.push(part_bootstrap_token_name);
            
            var part_bootstrap_token = bootstrap_manager.createMandatoryElement(part_bootstrap_token_name);
    
            try {
                child_process.exec("cd " + path + "views && find . -name '*." + file_extension + "'", function(err, stdout, stderr) {
                    var view_files = [];
                    
                    if (!err) {
                        var files_in_folder = stdout.split("\n");
                        
                        for (i in files_in_folder) {
                            var file = files_in_folder[i].substr(2);
                            if (file !== "") {
                                view_files.push(file);
                            }
                        }
                    }
                    
                    self.current_plugin_name = plugin_name;
                    
                    for (i in view_files) {
                        var view_file_name = view_files[i];
                        view_name = view_file_name.substr(0, view_file_name.length - file_extension.length - 1);
                        new engine(view_name, path + 'views/' + view_file_name);
                    }
                    
                    delete self.current_plugin_name;
                    
                    bootstrap_manager.finishMandatoryElement(part_bootstrap_token);
                });
            } catch (e) {
                /*
                 * views folder does not exist!
                 */
                bootstrap_manager.finishMandatoryElement(part_bootstrap_token);
            }
        })(this.view_engines[i]);
        
    }
    
    bootstrap_manager.whenReady(views_bootstrap_parts, function() {
        bootstrap_manager.finishMandatoryElement(views_bootstrap_token);
    });
};

/**
 * Add a new view engine by file pattern.
 */
ViewManager.prototype.addViewEngine = function(file_pattern, engine_name) {
    this.trace('addViewEngine', arguments);
    this.view_engines.push([
        file_pattern, engine_name
    ]);
};
