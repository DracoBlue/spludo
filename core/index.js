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

require("./StringToolkit");

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

require("./ContextToolkit");
require("./Context");

require("./MemoryStorage");
require("./PostgresStorage");
require("./StorageManager");

/**
 * The global storage manager.
 * 
 * @type StorageManager
 */
storage_manager = new StorageManager();

require("./SessionManager");

require("./StaticFilesManager");
static_files_manager = new StaticFilesManager();

require("./Controller");
require("./ControllerManager");

/**
 * The global controller manager.
 * 
 * @type ControllerManager
 */
controller_manager = new ControllerManager();

require("./JsView");
require("./EjsView");
require("./ViewManager");

/**
 * The global view manager.
 * 
 * @type ViewManager
 */
view_manager = new ViewManager();

require("./DataMapper");
require("./DataMapperManager");

/**
 * The global data mapper manager.
 * 
 * @type DataMapperManager
 */
data_mapper_manager = new DataMapperManager();

if (!config.get('core', {}).disable_core_data_mappers) {
    require("./core-data-mappers");
}

require("./Validator");
require("./ValidatorManager");

/**
 * The global validator manager.
 * 
 * @type ValidatorManager
 */
validator_manager = new ValidatorManager();

require("./Validation");

if (!config.get('core', {}).disable_core_validators) {
    require("./core-validators");
}

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
 * Find all /lib, modulename/lib folders and append them to the require path.
 */
var lib_folders = [application_directory + "lib"];
for ( var m = 0; m < module_names.length; m++) {
    lib_folders.push(application_directory + "modules/" + module_names[m] + "/lib");
}

for ( var f = 0; f < lib_folders.length; f++) {
    try {
        posix.stat(lib_folders[f]).addCallback(function (stats) {
            if (stats.isDirectory()) {
                Logging.prototype.info("index: Adding "+lib_folders[f]+" as lib.");
                require.paths.push(lib_folders[f]);
            }
            try {
                posix.stat(lib_folders[f] + "/index.js").addCallback(function (stats) {
                    Logging.prototype.info("index: Loading "+lib_folders[f]+"/index.js.");
                    require(lib_folders[f] + "/index");
                }).wait();
            } catch (e) {
                /*
                * Folder does not exist!
                */
            }
        }).wait();
    } catch (e) {
        /*
         * Folder does not exist!
         */
    }
}

/*
 * Load the static folder, if the core has one.
 */
try {
    posix.stat(application_directory + "static").addCallback(function (stats) {
        static_files_manager.addFolder(application_directory + "static/");
    }).wait();
} catch (e) {
    /*
    * Folder does not exist!
    */
}

/**
 * The global session manager.
 * 
 * @type SessionManager
 */
session_manager = new SessionManager(config.get("session", {}));

/*
 * Load controllers and views
 */
controller_manager.loadControllers(application_directory);
view_manager.loadViews(application_directory);

/*
 * For each module, load what needs to be loaded.
 */
for ( var i = 0; i < module_names.length; i++) {
    var module_name = module_names[i];
    var module_folder = application_directory + "modules/" + module_name + "/";
    
    controller_manager.loadControllers(module_folder, module_name);
    view_manager.loadViews(module_folder, module_name);
    
    try {
        posix.stat(module_folder + "static/").addCallback(function (stats) {
            static_files_manager.addFolder(module_folder + "static/");
        }).wait();
    } catch (e) {
        /*
        * Folder does not exist!
        */
    }
    
}



require("./BaseApplication");
require("./ServerApplication");
require("./ConsoleApplication");
require("./TestApplication");
