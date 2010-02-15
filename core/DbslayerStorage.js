/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class The postgres storage.
 * 
 * @example How to use the postgres storage:
 * 
 * 1. Create the database:
 * <pre>
 * create table s (k text PRIMARY KEY, v text);
 * </pre>
 * 
 * 2. Put postgres.js and the postgres-js folder into your
 * applications lib directory:
 * <pre>
 *   myapp/lib/postgres.js
 *   myapp/lib/postgres-js/ 
 * </pre>
 * 
 * 3. Configure the Postgres-Storage:
 * <pre>
 *    database: &quot;mydb&quot;,
 *    password: &quot;mypwd&quot;,
 *    username: &quot;mydbuser&quot;,
 *    table: &quot;s&quot;
 * </pre>
 * 
 * @requires postgres-js http://github.com/creationix/postgres-js
 * 
 * @param {Object} options Options to specify the behavior
 * @param {String} options.database The name of the database
 * @param {String} options.username The username for the database
 * @param {String} options.password The password for the database
 * @param {String} options.table The table to use as storage
 * @param {String} [options.host=127.0.0.1] The host for the connection
 * @param {Number} [options.port=5432] The port for the connection 
 *
 * @extends Options
 * @extends Logging
 * 
 * @since 0.1
 * @author DracoBlue
 */
DbslayerStorage = function(name, options) {

    var port = options.port || 9090;
    var host = options.host || '127.0.0.1';

    var table_name = options.table;

    delete options.host;
    delete options.port;
    delete options.table;

    var db = null;
    
    /**
     * Reconnect to the database.
     * 
     * @private
     */
    this.db_reconnect = function() {
        db = new DbslayerDatabaseConnection(name, {
            "host": host,
            "port": port
        });
    };

    this.db_reconnect();

    /**
     * Escape a string for sql statements.
     * 
     * @param {String} input string
     * @return {String} sql escaped string
     * @private
     */
    var db_escape_string = function(string) {
        return string.replace(/'/g, "''");
    };

    /**
     * Retrieve a value from the storage (or undefined if empty).
     * 
     * @param {String}
     *            key of the value
     * @return {String|undefined} The value
     */
    this.get = function(key) {
        this.log("DbslayerStorage:get: " + key);
        var element = db.retrieveById(table_name, key);
        
        if (element !== null) {
            return element.v;
        }
    };
    
    /**
     * Set a value in the storage.
     * 
     * @param {String}
     *            key The key
     * @param {String}
     *            value The value
     */
    this.set = function(key, value) {
        this.log("DbslayerStorage:set: " + key);
        key = db_escape_string(key);
        value = db_escape_string(value);
        
        var entry = {
            '_table': table_name,
            id: key,
            v: value
        };
        
        db.store(entry);
    };

    
    /**
     * Remove a value from the storage.
     * 
     * @param {String}
     *            key of the value
     */
    this.remove = function(key) {
        this.log("DbslayerStorage:remove: " + key);
        db.deleteById(table_name, key);
    };
    
    this.setOptions(options);

    /**
     * Shutdown the database.
     * 
     * @private
     */
    this.db_shutdown = function() {
//        db.close();
    };
    
    storage_manager.addStorage(name, this);
};

process.mixin(true, DbslayerStorage.prototype, Options.prototype, Logging.prototype);

/**
 * Check whether the storage has a value for this key.
 * 
 * @param {String}
 *            key of the value
 * @return {Boolean} If the key has a value
 */
DbslayerStorage.prototype.has = function(key) {
    this.log("DbslayerStorage:has: " + key);
    return typeof this.get(key) !== "undefined";
};

/**
 * Shutdown the storage
 */
DbslayerStorage.prototype.shutdown = function() {
    this.log("DbslayerStorage:shutdown");

    this.db_shutdown();
};
