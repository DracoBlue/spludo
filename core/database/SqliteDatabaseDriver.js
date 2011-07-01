/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2011 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var child_process = require('child_process');

/**
 * @class A database driver for sqlite.
 *
 * This driver needs the sqlite-module installed. Install by using: <pre>
 *   npm install sqlite
 * </pre>
 *
  * @param {String}
 *      name Name of the sqlite database driver instance
 * @param {String}
 *      [options.database=null] Name of the database attached to this driver 
 * @param {String}
 *      [options.command]="sqlite3"] The command line tool to execute raw
 *          commands on the database
 *    
 * @extends BaseSqlDatabaseDriver
 */
SqliteDatabaseDriver = function(name, options) {
    var that = this;
    
    this.client = null;
    
    this.connectToDatabase = function(callback) {
        if (that.client === null) {
            var database = require('sqlite').Database();
            database.open(options.database, function(error) {
                that.client = database;
                callback();
            });
        } else {
            callback();
        }
    };
    
    this.executeRawCommand = function(parameter_string) {
        return function(cb) {
            var command_parts = [
                options['command'] ? options['command'] : 'sqlite3'
            ];
            
            command_parts.push(options.database);
            command_parts.push(parameter_string);
            
            child_process.exec(command_parts.join(' '), function(error, stdout, stderr) {
                cb(error, stdout, stderr);
            });        
        };
    };    
};

extend(true, SqliteDatabaseDriver.prototype, BaseSqlDatabaseDriver.prototype);
SqliteDatabaseDriver.prototype.logging_prefix = 'SqliteDatabaseDriver';

/**
 * Execute an operation on the database. The return value is the amount of affected rows
 * or the last insert id. 
 * 
 * @returns {Boolean} Did an error occur?
 * @returns {Number} Affected rows or last insert id
 */
SqliteDatabaseDriver.prototype.execute = function(sql, parameters) {
    var that = this;
    return function(cb) {
        that.connectToDatabase(function() {
            that.client.prepare(sql, {
                lastInsertRowID: true,
                affectedRows: true
            }, function (error, statement) {
                if (error) {
                    cb(true, error);
                    return ;
                }
                
                statement.bindArray(parameters || [], function () {
                    statement.step(function (error, row) {
                        var affected_rows_or_last_insert_id = this.affectedRows || 0;
                        if (sql.trim().toLowerCase().indexOf('insert') === 0) {
                            affected_rows_or_last_insert_id = this.lastInsertRowID || 0;
                        }
                        statement.finalize(function (finalize_error) {
                            if (error) {
                                cb(true, error);
                                return ;
                            }
                            cb(false, affected_rows_or_last_insert_id);
                        });
                    });                
                });                
            });
        });
    };
};

/**
 * Query the database with a specific sql command for matching rows. Those
 * will be returned in an array.
 * 
 * @returns {Boolean} Did an error occur?
 * @returns {Object}[] The results of the query as array
 */
SqliteDatabaseDriver.prototype.query = function(sql, parameters) {
    var that = this;
    return function(cb) {
        that.connectToDatabase(function() {
            that.client.execute(sql, parameters || [], function(error, results) {
                if (error) {
                    cb(true, error);
                    return ;
                }
                cb(false, results);
            });
        });
    };
};

/**
 * Shuts down the database driver and closes the client connection
 */
SqliteDatabaseDriver.prototype.shutdown = function() {
    var that = this;
    return function(cb) {
        if (that.client) {
            that.client.close(function() {
                cb();
            });
        } else {
            cb();
        }
    };
};

/**
 * @private
 * 
 * @param {TableColumnMeta}[] field_options
 * 
 * @returns {String} A string which can be used in create table or add/drop
 *      column sql statements
 */
SqliteDatabaseDriver.prototype.generateColumnDefinitionLineForFieldOptions = function(field_options) {
    field_options = field_options || {};
    var query_parts = [];

    if (typeof field_options["type"] !== 'undefined') {
        query_parts.push(' ');
        query_parts.push(field_options["type"]);
        if (typeof field_options["type_size"] !== 'undefined') {
            query_parts.push('(');
            query_parts.push(field_options["type_size"]);
            query_parts.push(')');
        }
    }
    
    if (typeof field_options["null"] !== 'undefined') {
        if (field_options["null"]) {
            query_parts.push(" NULL");
        } else {
            query_parts.push(" NOT NULL");
        }
    }

    if (typeof field_options["primary"] !== 'undefined') {
        if (field_options["primary"]) {
            query_parts.push(" PRIMARY KEY");
        }
    }
    
    if (typeof field_options["auto_increment"] !== 'undefined') {
        if (field_options["auto_increment"]) {
            query_parts.push(" AUTOINCREMENT");
        }
    }

    if (typeof field_options["default"] !== 'undefined') {
        if (field_options["default"]) {
            query_parts.push(" DEFAULT ");
            if (field_options["default"] === null) {
                query_parts.push(" NULL");
            } else {
                query_parts.push(this.escapeValue(field_options["default"]));
            }
        }
    }
    
    return query_parts.join(' ');
};

SqliteDatabaseDriver.prototype.alterColumn = function(table_name, field_name, field_options) {
    var that = this;

    return function(cb) {
        cb(true, 'Sqlite does not implement alterColumn');
    };
};

SqliteDatabaseDriver.prototype.dropColumn = function(table_name, field_name, field_options) {
    var that = this;

    return function(cb) {
        cb(true, 'Sqlite does not implement dropColumn');
    };
};

/**
 * Retrieve the meta data about all columns in that table.
 * 
 * @returns {Boolean} Did an error occur?
 * @returns {TableColumnMeta}[]
 */
SqliteDatabaseDriver.prototype.getTableMeta = function(table_name) {
    var that = this;
    return function(cb) {
        that.connectToDatabase(function() {
            that.client.execute('SELECT sql FROM sqlite_master WHERE type=\'table\' and name=\'' + table_name + '\';', function (err, results) {
                if (err) {
                    cb(true, err);
                    return ;
                }
                
                if (results.length === 0) {
                    cb(true, 'Table not found!');
                    return ;
                }
                
                var sql = results[0].sql;
                
                var fields = [];
                
                var raw_parts = /^CREATE[^\(]+\((.*)\)$/.exec(sql)[1].split(', ');
                
                for (var i = 0; i < raw_parts.length; i++) {
                    raw_parts[i] = raw_parts[i].trim();
                    var field_name = null;
                    var type_name = null;
                    var type_size = null;
                    var field_options = '';
                    
                    var field_data = null;

                    field_data = /([^ ]+)[ ]+([^ ]+)[ ]+\(([^\)]+)\)( .*)?/.exec(raw_parts[i]);
                    
                    if (field_data) {
                        field_name = field_data[1];
                        type_name = field_data[2];
                        type_size = parseInt(field_data[3].trim(), 10);
                        field_options = ' ' + (field_data[4] || '') + ' ';
                    } else {
                        field_data = /([^ ]+)[ ]+([^ ]+)( .*)?/.exec(raw_parts[i]);
                        field_name = field_data[1];
                        type_name = field_data[2];
                        field_options = ' ' + (field_data[3] || '') + ' ';
                    }
                    
                    var default_value = null;
                    /*
                     * This is _really_ hacky. We shouldn't do it that way ...
                     */
                    var default_values_data = / DEFAULT[ ]+(.+)$/.exec(field_options);
                    if (default_values_data) {
                        default_value = that.unescapeValue(default_values_data[1].trim());
                    }
                    
                    fields.push({
                        'name': field_name,
                        'type': type_name,
                        'type_size': type_size,
                        'null': field_options.indexOf(' NOT NULL  ') !== -1 ? false : true,
                        'primary': field_options.indexOf(' AUTOINCREMENT ') !== -1 ? true : false,
                        'default': default_value
                    });
                }
                
                cb(false, fields);
            });            
        });
    };
};

/**
 * Escape the value in such way, that it can be inserted in any sql query
 * without sql injection issues
 * 
 * @param {Number|String|Boolean}
 *      [value]
 * @return {String}
 */
SqliteDatabaseDriver.prototype.escapeValue = function(value) {
    if (typeof value === 'number') {
        return value;
    }
    
    return '\'' + value.toString().replace(/'/g,'\'\'') + '\'';
};

/**
 * Unescape a value, which was previously escaped to prevent sql injection.
 * 
 * @private
 * @param {String}
 * @return {String}
 */
SqliteDatabaseDriver.prototype.unescapeValue = function(value) {
    if (typeof value === 'number') {
        return value;
    }
    
    var value_string = value.toString();
    if (value_string.substr(0, 1) === '\'' && value_string.substr(-1, 1) === '\'') {
        return value_string.substr(1, value_string.length -2).replace(/\'\'/g,'\'');
    }
    
    throw new Error('Invalid escaped value!');
};

/**
 * Store the structure (not the data!) of this database to a file.
 * @returns {Boolean} Did an error occur?
 */
SqliteDatabaseDriver.prototype.dumpStructureToFile = function(file_name) {
    var that = this;
    return function(cb) {
        /*
         * First of all the structure of the database
         */
        that.executeRawCommand('\'.schema\' > ' + file_name)(function(error, stdout, stderr) {
            /*
             * Now the contents of the executed_migrations table
             */
            that.executeRawCommand('\'.dump executed_migrations\' >> ' + file_name)(function(error, stdout, stderr) {
                cb(error);
            });
        });
    };
};

/**
 * Store the entire database to a file.
 * 
 * @returns {Boolean} Did an error occur?
 */
SqliteDatabaseDriver.prototype.dumpDatabaseToFile = function(file_name) {
    var that = this;
    return function(cb) {
        that.executeRawCommand('\'.dump\' > ' + file_name)(function(error, stdout, stderr) {
            cb(error);
        });
    };
};

/**
 * Load the database structure from a file. Wipes the data if the dump contains
 * drop table statements.
 * 
 * @returns {Boolean} Did an error occur?
 */
SqliteDatabaseDriver.prototype.loadStructureFromFile = function(file_name) {
    var that = this;
    return function(cb) {
        that.executeRawCommand('\'.read ' + file_name + '\'')(function(error, stdout, stderr) {
            cb(error);
        });
    };
};

/**
 * Load the entire database from a file.
 * @returns {Boolean} Did an error occur?
 */
SqliteDatabaseDriver.prototype.loadDatabaseFromFile = function(file_name) {
    var that = this;
    return function(cb) {
        that.executeRawCommand('\'.read ' + file_name + '\'')(function(error, stdout, stderr) {
            cb(error);
        });
    };
};