/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class The manager for all registered layouts.
 * 
 * @extends Logging
 * 
 * @since 0.1 
 * @author DracoBlue
 */
LayoutManager = function() {
    this.layouts = {};
};

process.mixin(true, LayoutManager.prototype, Logging.prototype);

LayoutManager.prototype.addLayout = function(name, layout, module_name) {
    module_name = this.current_module_name || module_name;

    this.info("addLayout: module:" + module_name + ", name:" + name);

    if (module_name) {
        this.layouts[module_name + "." + name] = layout;
        if (typeof this.layouts[name] === "undefined") {
            this.layouts[name] = layout;
        }
    } else {
        this.layouts[name] = layout;
    }
};

/**
 * Retrieve a specific layout by name
 */
LayoutManager.prototype.getLayout = function(name, module_name) {
    module_name = module_name || null;

    var layout = null;

    if (module_name !== null) {
        layout = this.layouts[module_name + "." + name] || this.layouts[name];
    } else {
        layout = this.layouts[name] || null;
    }

    if (layout === null) {
        throw new Error("Layout not found for name " + name + " (module: " + (module_name || "") + ")!");
    }

    return layout;
};

/**
 * Get all available layouts and load them ... .
 */
LayoutManager.prototype.loadLayouts = function(path, module_name) {
    this.current_module_name = module_name;

    this.info("loadLayouts: module:" + module_name + ", path:" + path);

    var sys = require('sys');
    var layout_files = [];
    try {
        sys.exec("ls " + path + "views/layouts/*.js").addCallback(function(stdout, stderr) {
            var files_in_folder = stdout.split("\n");

            for (i in files_in_folder) {
                if (files_in_folder[i] !== "") {
                    layout_files.push(files_in_folder[i]);
                }
            }
        }).wait();
    } catch (e) {
        /*
         * layouts folder does not exist!
         */
    }

    for (i in layout_files) {
        require(layout_files[i].substr(0, layout_files[i].length - 3));
    }

    delete this.current_module_name;
};

