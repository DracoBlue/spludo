/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var sys = require('sys');
var http = require('http');
var fs = require('fs');

var application_directory = process.cwd() + "/";

require('./util');

require("./StringToolkit");
require("./ObjectToolkit");

require("./Config");

/**
 * The global configuration object.
 * 
 * @type Config
 */
config = new Config();

config.setValues({
    "core": {
        "version": '2.0.0',
        "application_path": application_directory
    }
});
try {
    require(application_directory + "config");
} catch (e) {
    /*
     * It's a pity, we don't have a config file :(.
     */
}

try {
    require(application_directory + "local.config");
} catch (e) {
    /*
     * It's a pity, we don't have a local.config file :(.
     */
}

if (!config.get('logging', {}).log_core) {
    (function() {
        var logging_config = config.get('logging', {});
        logging_config.hide_classes = logging_config.hide_classes || [];

        var core_classes = [
            "BaseApplication",
            "BootstrapManager",
            "ControllerManager",
            "ConsoleApplication",
            "DataMapperManager",
            "ServerApplication",
            "StaticFilesManager",
            "StorageManager",
            "ViewManager",
            "ValidatorManager"
        ];

        var core_classes_length = core_classes.length;

        for (var i = 0; i < core_classes_length; i++) {
            logging_config.hide_classes.push(core_classes[i]);
        }

        config.setValues('logging', logging_config);
    })();
}

require("./Options");
require("./Logging");

require("./BootstrapManager");

/**
 * The global bootstrap manager
 * 
 * @type BootstrapManager
 */
bootstrap_manager = new BootstrapManager();

require("./ContextToolkit");
require("./Context");

require("./ServiceManager");
require("./ApiServiceController");

/**
 * The global service manager
 * 
 * @type ServiceManager
 */
service_manager = new ServiceManager();

require("./storage/MemoryStorage");
require("./storage/StorageManager");

/**
 * The global storage manager.
 * 
 * @type StorageManager
 */
storage_manager = new StorageManager();

require("./database/DatabaseManager");

/**
 * The global database manager
 * 
 * @type DatabaseManager
 */
database_manager = new DatabaseManager();

/*
 * Databases:
 */
require("./database/DatabaseMigration");
require("./database/BaseSqlDatabaseDriver");
require("./database/MysqlDatabaseDriver");
require("./database/SqliteDatabaseDriver");

require("./server/CookieSessionManager");

require("./server/StaticFilesManager");
static_files_manager = new StaticFilesManager();

require("./Controller");
require("./SyncController");
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
view_manager.addViewEngine('ejs', 'EjsView');

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

var lib_token = bootstrap_manager.createMandatoryElement('lib');

/*
 * Initialize all lib/index.js files
 */
var lib_folder_exists = false;
var lib_folder_path = application_directory + "lib";
try {
    lib_folder_stats = fs.statSync(lib_folder_path);
    if (lib_folder_stats.isDirectory()) {
        lib_folder_exists = true;
    }
} catch (e) {
    /*
     * Folder does not exist!
     */
}
if (lib_folder_exists) {
    var lib_index_file_exists = false;
    try {
        index_js_stats = fs.statSync(lib_folder_path + "/index.js");
        lib_index_file_exists = true;
    } catch (e) {
        /*
         * Index file does not exist!
         */
    }
    
    if (lib_index_file_exists) {
        require(lib_folder_path + "/index");
    }
}


bootstrap_manager.finishMandatoryElement(lib_token);

/*
 * Load the static folder, if the core has one.
 */
try {
    static_folder_stats = fs.statSync(application_directory + "static");
    static_files_manager.addFolder(application_directory + "static/");
} catch (e) {
    /*
    * Folder does not exist!
    */
}

var session_manager_engine = GLOBAL[config.get("session_manager_engine", "CookieSessionManager")];

/**
 * The global session manager.
 * 
 * @type SessionManager
 */
session_manager = new session_manager_engine(config.get("session", {}));

/*
 * Load controllers and views
 */
controller_manager.loadControllers(application_directory);
view_manager.loadViews(application_directory);

require("./BaseApplication");
require("./server/ServerApplication");
require("./console/ConsoleApplication");
