/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
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
PostgresStorage = function(name, options) {

    var database_name = options.database;
    var username = options.username;
    var password = options.password;
    var port = options.port || 5432;
    var host = options.host || '127.0.0.1';

    this.table_name = options.table;

    delete options.database;
    delete options.username;
    delete options.password;
    delete options.table;
    delete options.port;
    delete options.host;

    var db = null;
    
    /**
     * Reconnect to the database.
     * 
     * @private
     */
    this.db_reconnect = function() {
        var Postgres = require("postgres");
        db = new Postgres.Connection(database_name, username, password, port, host);
    };

    this.db_reconnect();

    /**
     * Query the database.
     * 
     * @param {String} sql the sql to execute
     * @param {Function} callback will be called if the query was successful
     * 
     * @private
     */ 
    this.db_query = function(sql, callback) {
        db.query(sql, callback);
    };
    
    /**
     * Escape a string for sql statements.
     * 
     * @param {String} input string
     * @return {String} sql escaped string
     * @private
     */
    this.db_escape_string = function(string) {
        return string.replace(/'/g, "''");
    };
    
    this.setOptions(options);

    /**
     * Shutdown the database.
     * 
     * @private
     */
    this.db_shutdown = function() {
        db.close();
    };
    
    storage_manager.addStorage(name, this);
};

process.mixin(true, PostgresStorage.prototype, Options.prototype, Logging.prototype);

/**
 * Set a value in the storage.
 * 
 * @param {String}
 *            key The key
 * @param {String}
 *            value The value
 */

PostgresStorage.prototype.set = function(key, value) {
    this.log("PostgresStorage:set: " + key);
    key = this.db_escape_string(key);
    value = this.db_escape_string(value);

    var empty_func = function() {
    };

    this.db_query("INSERT INTO " + this.table_name + " VALUES ('" + key + "', '" + value + "')", empty_func);
    this.db_query("UPDATE " + this.table_name + " SET v = '" + value + "' WHERE k = '" + key + "'", empty_func);

};

/**
 * Retrieve a value from the storage (or undefined if empty).
 * 
 * @param {String}
 *            key of the value
 * @return {String|undefined} The value
 */

PostgresStorage.prototype.get = function(key) {
    this.log("PostgresStorage:get: " + key);
    key = this.db_escape_string(key);

    var p = new process.Promise();

    var result;

    this.db_query("SELECT v FROM " + this.table_name + " WHERE k = '" + key + "'", function(data) {
        if (data.length) {
            result = data[0]["v"];
        }
        p.emitSuccess();
    });

    p.wait();

    return result;
};

/**
 * Check whether the storage has a value for this key.
 * 
 * @param {String}
 *            key of the value
 * @return {Boolean} If the key has a value
 */
PostgresStorage.prototype.has = function(key) {
    this.log("PostgresStorage:has: " + key);
    return typeof this.get(key) !== "undefined";
};

/**
 * Remove a value from the storage.
 * 
 * @param {String}
 *            key of the value
 */
PostgresStorage.prototype.remove = function(key) {
    this.log("PostgresStorage:remove: " + key);
    key = this.db_escape_string(key);

    var p = new process.Promise();

    this.db_query("DELETE FROM " + this.table_name + " WHERE k = '" + key + "'", function(data) {
        p.emitSuccess();
    });

    p.wait();
};

/**
 * Shutdown the storage
 */
PostgresStorage.prototype.shutdown = function() {
    this.log("PostgresStorage:shutdown");

    this.db_shutdown();
};
