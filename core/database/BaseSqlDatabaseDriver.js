/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2011 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var child_process = require('child_process');

/**
 * @class A base class for sql database drivers.
 *
 * @extends Logging
 */
BaseSqlDatabaseDriver = function(name, options) {
    throw new Error('This is a base for other drivers. Please don\'t instantiate it directly.');
};

extend(true, BaseSqlDatabaseDriver.prototype, Logging.prototype);
BaseSqlDatabaseDriver.prototype.logging_prefix = 'BaseSqlDatabaseDriver';

BaseSqlDatabaseDriver.prototype.query = function(sql, parameters) {
    throw new Error('Abstract method is not, yet implemented in: ' + this.logging_prefix);
};

BaseSqlDatabaseDriver.prototype.execute = function(sql, parameters) {
    throw new Error('Abstract method is not, yet implemented in: ' + this.logging_prefix);
};

BaseSqlDatabaseDriver.prototype.getTableMeta = function(table_name) {
    throw new Error('Abstract method is not, yet implemented in: ' + this.logging_prefix);
};

BaseSqlDatabaseDriver.prototype.escapeValue = function(value) {
    throw new Error('Abstract method is not, yet implemented in: ' + this.logging_prefix);
};

BaseSqlDatabaseDriver.prototype.dumpStructureToFile = function(file_name) {
    throw new Error('Abstract method is not, yet implemented in: ' + this.logging_prefix);
};

BaseSqlDatabaseDriver.prototype.dumpDatabaseToFile = function(file_name) {
    throw new Error('Abstract method is not, yet implemented in: ' + this.logging_prefix);
};

BaseSqlDatabaseDriver.prototype.loadStructureFromFile = function(file_name) {
    throw new Error('Abstract method is not, yet implemented in: ' + this.logging_prefix);
};

BaseSqlDatabaseDriver.prototype.loadDatabaseFromFile = function(file_name) {
    throw new Error('Abstract method is not, yet implemented in: ' + this.logging_prefix);
};

BaseSqlDatabaseDriver.prototype.selectTableRows = function(table_name, where_condition, where_parameters) {
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

BaseSqlDatabaseDriver.prototype.updateTableRows = function(table_name, values, where_condition, where_parameters) {
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
            cb(true, 0);
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

        that.execute(sql_string_parts.join(''), sql_parameters)(function(error, affected_rows) {
            cb(error, affected_rows);
        });        
    };
};

BaseSqlDatabaseDriver.prototype.createTableRow = function(table_name, values) {
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

        that.execute(sql_string_parts.join(''), sql_parameters)(function(error, last_insert_id) {
            cb(error, last_insert_id);
        });        
    };
};

BaseSqlDatabaseDriver.prototype.deleteTableRows = function(table_name, where_condition, where_parameters) {
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

        that.execute(sql_string_parts.join(''), sql_parameters)(function(error, affected_rows) {
            cb(error, affected_rows);
        });        
    };
};

BaseSqlDatabaseDriver.prototype.shutdown = function() {
    return function(cb) {
        cb();
    };
};

BaseSqlDatabaseDriver.prototype.createTable = function(table_name, fields) {
    var that = this;
    
    var field_parts = [];
    for (var field_name in fields) {
        if (fields.hasOwnProperty(field_name)) {
            var field = fields[field_name];
            field_parts.push('`' + field_name + '` ' + that.generateColumnDefinitionLineForFieldOptions(field));
        }
    }

    return function(cb) {
        that.execute('CREATE TABLE `' + table_name + '` (' + field_parts.join(', ') + ')')(function (err, message) {
            if (err) {
                cb(true, message);
                return ;
            }
            
            cb(false);
        });
    };
};

BaseSqlDatabaseDriver.prototype.dropTable = function(table_name) {
    var that = this;
    
    return function(cb) {
        that.execute('DROP TABLE `' + table_name + '`')(function (err, message) {
            if (err) {
                cb(true, message);
                return ;
            }
            
            cb(false);
        });
    };
};

BaseSqlDatabaseDriver.prototype.addColumn = function(table_name, field_name, field_options) {
    var that = this;

    return function(cb) {
        that.execute('ALTER TABLE `' + table_name + '` ADD  `' + field_name + '`' + that.generateColumnDefinitionLineForFieldOptions(field_options))(function (err, message) {
            if (err) {
                cb(true, message);
                return ;
            }
            
            cb(false);
        });
    };
};

BaseSqlDatabaseDriver.prototype.alterColumn = function(table_name, field_name, field_options) {
    var that = this;
    var new_field_name = field_options.name || field_name;
    
    return function(cb) {
        that.execute('ALTER TABLE `' + table_name + '` CHANGE `' + field_name + '` `' + new_field_name + '`' + that.generateColumnDefinitionLineForFieldOptions(field_options))(function (err, message) {
            if (err) {
                cb(true, message);
                return ;
            }
            
            cb(false);
        });
    };
};

BaseSqlDatabaseDriver.prototype.dropColumn = function(table_name, field_name) {
    var that = this;

    return function(cb) {
        that.execute('ALTER TABLE `' + table_name + '` DROP `' + field_name + '`')(function (err, message) {
            if (err) {
                cb(true, message);
                return ;
            }
            
            cb(false);
        });
    };
};
