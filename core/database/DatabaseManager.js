/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class The manager for all registered databases.
 * 
 * @extends Logging
 */
DatabaseManager = function() {
    this.databases = {};
};

extend(true, DatabaseManager.prototype, Logging.prototype);

DatabaseManager.prototype.logging_prefix = 'DatabaseManager';

DatabaseManager.prototype.getDatabase = function(name) {
    if (!this.databases[name]) {
        var options = config.get('database_connections', {})[name];
        if (typeof options === 'undefined') {
            throw new Error("Database Configuration for name " + name + " not found!");
        } else {
            var engine = GLOBAL[options.driver_name || "StorageDatabaseDriver"];
            this.databases[name] = new engine(name, options.driver_options || {});            
        }
    }
    return this.databases[name];
};

DatabaseManager.prototype.shutdown = function() {
    this.trace("shutdown", arguments);
    var self = this;
    
    return function(cb) {
        var shutdown_chain = [];
        
        for (name in self.databases) {
            /*
             * Check whether this database has a shutdown method.
             */
            if (typeof self.databases[name].shutdown === "function") {
                (function(current_database) {
                    shutdown_chain.push(function(chain_cb) {
                        try {
                            current_database.shutdown()(function() {
                                chain_cb();
                            });
                        } catch (e) {
                            self.warn("Exception when trying to shutdown database " + name);
                            self.warn(e);
                            chain_cb();
                        }
                    });
                })(self.databases[name]);
            }
        }
        
        if (shutdown_chain.length) {
            group.apply(GLOBAL, shutdown_chain)(function() {
                cb();
            });
        } else {
            cb();
        }
    };
};
