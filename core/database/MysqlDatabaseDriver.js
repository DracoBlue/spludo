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

extend(true, MysqlDatabaseDriver.prototype, BaseSqlDatabaseDriver.prototype);
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

MysqlDatabaseDriver.prototype.execute = function(sql, parameters) {
    var that = this;
    return function(cb) {
        that.client.query(sql, parameters || [], function (err, results, fields) {
            if (err) {
                cb(true, err);
                return ;
            }
            cb(false, results.insertId || results.affectedRows || 0);
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

MysqlDatabaseDriver.prototype.generateColumnDefinitionLineForFieldOptions = function(field_options) {
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
            query_parts.push(" AUTO_INCREMENT");
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
                        'default': result.Default,
                        'auto_increment': result.Extra.split(' ').indexOf('auto_increment') === -1 ? false : true
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
        that.executeRawCommand('mysql', ' < ' + file_name)(function(error, stdout, stderr) {
            cb(error);
        });
    };
};