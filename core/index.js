/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var sys = require('sys');
var http = require('http');
var posix = require('posix');

var application_directory = process.cwd() + "/";

process.isFunction = function(object) {
    return (typeof object == "function") ? true : false;
};

require("./Config");

/**
 * The global configuration object.
 * 
 * @type Config
 */
config = new Config();

try {
    require(application_directory + "config");
} catch (e) {
    /*
     * It's a pitty, we don't have a config file :(.
     */
}

require("./Options");
require("./Logging");
require("./Controller");
require("./ControllerManager");

/**
 * The global controller manager.
 * 
 * @type ControllerManager
 */
controller_manager = new ControllerManager();
controller_manager.loadControllers(application_directory);

require("./JsView");
require("./EjsView");
require("./ViewManager");

/**
 * The global view manager.
 * 
 * @type ViewManager
 */
view_manager = new ViewManager();
view_manager.loadViews(application_directory);

var module_names = [];

try {
    posix.readdir(application_directory + "modules").addCallback(function(contents) {
        module_names = contents;
    }).wait();
} catch (e) {
    /*
     * We can't read the modules directory, cause there is none :(
     */
}

/*
 * For each module, load what needs to be loaded.
 */
for ( var i = 0; i < module_names.length; i++) {
    var module_name = module_names[i];
    controller_manager.loadControllers(application_directory + "modules/" + module_name + "/", module_name);
    view_manager.loadViews(application_directory + "modules/" + module_name + "/", module_name);
}


require("./Application");
require("./TestApplication");
