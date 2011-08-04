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
    this.databases = [];
    this.databases_by_name = {};
};

extend(true, DatabaseManager.prototype, Logging.prototype);

DatabaseManager.prototype.logging_prefix = 'DatabaseManager';

var Criteria = function() {
    this.where_parts = [];
    this.limit = null;
    this.offset = null;
    this.order_by_parts = [];
};

extend(true, Criteria.prototype, Logging.prototype);

Criteria.prototype.logging_prefix = 'Criteria';

Criteria.prototype.andWhere = function(key, operator, value) {
    this.where_parts.push([key, operator, value]);
};

Criteria.prototype.andWhereIn = function(key, values) {
    this.where_parts.push([key, 'IN', values]);
};

Criteria.prototype.getWhereParts = function() {
    return this.where_parts;
};

Criteria.prototype.getOrderByParts = function() {
    return this.order_by_parts;
};

Criteria.prototype.getLimit = function() {
    return this.limit;
};

Criteria.prototype.getOffset = function() {
    return this.offset;
};

Criteria.prototype.setLimit = function(limit) {
    this.limit = limit;
};

Criteria.prototype.setOffset = function(offset) {
    this.offset = offset;
};

Criteria.prototype.removeLimit = function() {
    this.limit = null;
};

Criteria.prototype.removeOffset = function() {
    this.offset = null;
};

Criteria.prototype.addOrderBy = function(key, direction) {
    this.order_by_parts.push([key, direction]);
};

DatabaseManager.prototype.getDatabase = function(name) {
    if (!this.databases_by_name[name]) {
        var options = config.get('database_connections', {})[name];
        if (typeof options === 'undefined') {
            throw new Error("Database Configuration for name " + name + " not found!");
        } else {
            var engine = GLOBAL[options.driver_name || "StorageDatabaseDriver"];
            var database = new engine(name, options.driver_options || {});
            this.databases_by_name[name] = database;
            this.databases.push(database);
        }
    }
    return this.databases_by_name[name];
};

DatabaseManager.prototype.createCriteria = function() {
    return new Criteria();
};

DatabaseManager.prototype.shutdown = function() {
    this.trace("shutdown", arguments);
    var that = this;
    
    return function(cb) {
        var shutdown_chain = [];
        
        that.databases.forEach(function(current_database) {
            /*
             * Check whether this database has a shutdown method.
             */
            if (typeof current_database.shutdown === "function") {
                shutdown_chain.push(function(chain_cb) {
                    try {
                        current_database.shutdown()(function() {
                            chain_cb();
                        });
                    } catch (e) {
                        that.warn("Exception when trying to shutdown database " + name);
                        that.warn(e);
                        chain_cb();
                    }
                });
            }
        });
        
        if (shutdown_chain.length) {
            group.apply(GLOBAL, shutdown_chain)(function() {
                cb();
            });
        } else {
            cb();
        }
    };
};
