/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2011 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var child_process = require('child_process');

/**
 * @class A database driver for mysql.
 *
 * This driver needs the mysql-module installed. Install by using: <pre>
 *   npm install mysql
 * </pre>
 *
 * @extends Logging
 */
MysqlDatabaseDriver = function(name, options) {
    this.client = new require('mysql').Client({
        "host": options.host,
        "password": options.password || null,
        "port": options.port || 3306,
        "user": options.user || null,
        "database": options.database || null
    });
    this.client.connect();
    
    this.executeRawCommand = function(tool, parameter_string) {
        return function(cb) {
            var command_parts = [
                options['command.' + tool] ? options['command.' + tool] : tool
            ];
            
            if (options.host) {
                command_parts.push('--host=' + options.host);
            }
            if (options.user) {
                command_parts.push('--user=' + options.user);
            }
            if (options.password) {
                command_parts.push('--password=' + options.password);
            }
            if (options.port) {
                command_parts.push('--port=' + options.port);
            }
            if (options.database) {
                command_parts.push(options.database);
            }
            
            command_parts.push(parameter_string);
            
            child_process.exec(command_parts.join(' '), function(error, stdout, stderr) {
                cb(error, stdout, stderr);
            });        
        };
    };
};

extend(true, MysqlDatabaseDriver.prototype, Logging.prototype);
MysqlDatabaseDriver.prototype.logging_prefix = 'MysqlDatabaseDriver';

MysqlDatabaseDriver.prototype.query = function(sql, parameters) {
    var that = this;
    return function(cb) {
        that.client.query(sql, parameters || [], function (err, results, fields) {
            if (err) {
                cb(true, err);
                return ;
            }
            cb(false, results);
        });
    };
};

MysqlDatabaseDriver.prototype.selectTableRows = function(table_name, where_condition, where_parameters) {
    var that = this;
    return function(cb) {
        var sql_parameters = [];

        var sql_string_parts = ['SELECT * FROM `' + table_name + '`'];

        if (where_condition && where_condition.length > 0) {
            sql_string_parts.push(' WHERE ' + where_condition);
        
            where_parameters = where_parameters || [];
            var where_parameters_length = where_parameters.length;
            for (var i = 0; i < where_parameters_length; i++) {
                sql_parameters.push(where_parameters[i]);
            }
        }

        that.query(sql_string_parts.join(''), sql_parameters)(function(error, results) {
            cb(error, results || []);
        });        
    };
};

MysqlDatabaseDriver.prototype.updateTableRows = function(table_name, values, where_condition, where_parameters) {
    var that = this;
    return function(cb) {
        var sql_parameters = [];

        var sql_string_parts = ['UPDATE `' + table_name + '` SET '];
        var sql_update_parts = [];

        for (var key in values) {
            if (values.hasOwnProperty(key)) {
                sql_update_parts.push('`' + key + '` = ?');
                sql_parameters.push(values[key]);
            }
        }

        if (sql_update_parts.length === 0) {
            /*
             * Nothing to do.
             */
            cb(true);
            return ;
        }

        sql_string_parts.push(' ' + sql_update_parts.join(', '));

        if (where_condition && where_condition.length > 0) {
            sql_string_parts.push(' WHERE ' + where_condition);
        
            where_parameters = where_parameters || [];
            var where_parameters_length = where_parameters.length;
            for (var i = 0; i < where_parameters_length; i++) {
                sql_parameters.push(where_parameters[i]);
            }
        }

        that.query(sql_string_parts.join(''), sql_parameters)(function(error, results) {
            cb(error, results.affectedRows || results.insertId || 0);
        });        
    };
};

MysqlDatabaseDriver.prototype.createTableRow = function(table_name, values) {
    var that = this;
    return function(cb) {
        var sql_parameters = [];

        var sql_string_parts = ['INSERT INTO `' + table_name + '` '];
        var sql_key_parts = [];
        var sql_value_parts = [];
        var sql_parameters = [];

        for (var key in values) {
            if (values.hasOwnProperty(key)) {
                sql_key_parts.push('`' + key + '`');
                sql_value_parts.push('?');
                sql_parameters.push(values[key]);
            }
        }

        sql_string_parts.push(' (' + sql_key_parts.join(', ') + ')');
        sql_string_parts.push(' VALUES (');
        sql_string_parts.push(sql_value_parts.join(', '));
        sql_string_parts.push(')');

        that.query(sql_string_parts.join(''), sql_parameters)(function(error, results) {
            cb(error, results.insertId || 0);
        });        
    };
};

MysqlDatabaseDriver.prototype.deleteTableRows = function(table_name, where_condition, where_parameters) {
    var that = this;
    return function(cb) {
        var sql_parameters = [];

        var sql_string_parts = ['DELETE FROM `' + table_name + '`'];

        if (where_condition && where_condition.length > 0) {
            sql_string_parts.push(' WHERE ' + where_condition);
        
            where_parameters = where_parameters || [];
            var where_parameters_length = where_parameters.length;
            for (var i = 0; i < where_parameters_length; i++) {
                sql_parameters.push(where_parameters[i]);
            }
        }

        that.query(sql_string_parts.join(''), sql_parameters)(function(error, results) {
            cb(error, results.affectedRows || results.insertId || 0);
        });        
    };
};

MysqlDatabaseDriver.prototype.shutdown = function() {
    var that = this;
    return function(cb) {
        that.client.end(function() {
            cb();
        });
    };
};

MysqlDatabaseDriver.prototype.getTableMeta = function(table_name) {
    var that = this;
    return function(cb) {
        that.client.query('DESC `' + table_name + '`;', function (err, results) {
            if (err) {
                cb(true, err);
                return ;
            }
            
            var fields = [];
            
            for (var key in results) {
                if (results.hasOwnProperty(key)) {
                    var result = results[key];
                    var type_data = result['Type'].match(/^([^\(]+)\(([^\(]+)\)/);
                    var type_name = (type_data && type_data[1]) || result['Type'];
                    var type_size = (type_data && parseInt(type_data[2], 10)) || null;

                    fields.push({
                        'name': result.Field,
                        'type': type_name,
                        'type_size': type_size,
                        'null': result.Null === 'NO' ? false : true,
                        'primary': result.Key === 'PRI' ? true : false,
                        'default': result.Default
                    });
                }
            }
            
            cb(false, fields);
        });
    };
};

MysqlDatabaseDriver.prototype.escapeValue = function(value) {
    return this.client.escape(value);
};

MysqlDatabaseDriver.prototype.dumpStructureToFile = function(file_name) {
    var that = this;
    return function(cb) {
        /*
         * First of all the structure of the database
         */
        that.executeRawCommand('mysqldump', '--compact --add-drop-table -d > ' + file_name)(function(error, stdout, stderr) {
            /*
             * Now the contents of the executed_migrations table
             */
            that.executeRawCommand('mysqldump', '--compact --add-drop-table --skip-create-options executed_migrations >> ' + file_name)(function(error, stdout, stderr) {
                cb(error);
            });
        });
    };
};

MysqlDatabaseDriver.prototype.dumpDatabaseToFile = function(file_name) {
    var that = this;
    return function(cb) {
        /*
         * First of all the structure of the database
         */
        that.executeRawCommand('mysqldump', ' > ' + file_name)(function(error, stdout, stderr) {
            cb(error);
        });
    };
};

MysqlDatabaseDriver.prototype.loadStructureFromFile = function(file_name) {
    var that = this;
    return function(cb) {
        that.executeRawCommand('mysql', ' < ' + file_name)(function(error, stdout, stderr) {
            cb(error);
        });
    };
};

MysqlDatabaseDriver.prototype.loadDatabaseFromFile = function(file_name) {
    var that = this;
    return function(cb) {
        /*
         * First of all the structure of the database
         */
        that.executeRawCommand('mysql', ' < ' + file_name)(function(error, stdout, stderr) {
            cb(error);
        });
    };
};