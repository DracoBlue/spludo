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


/**
 * @class Meta information about a database table column. It is returned by BaseSqlDatabaseDriver#getTableMeta
 * 
 * @extends Object
 * 
 * @property {String}
 *            name The name of the field
 * @property {String}
 *            type Type of the field (e.g. VARCHAR, INTEGER, TEXT)
 * @property {Number}
 *            type_size=null If the type of the field has a specific size,
 *            this porperty is set to the value. Otherwise it's null.
 * @property {Boolean}
 *            null Is it possible to set the column's value to null?
 * @property {Boolean}
 *            primary Is this column's part of the primary key?
 * @property {Boolean}
 *            auto_increment Has this column an auto_increment?
 * @property {String|Number|null}
 *            default=null Default value of this column
 */
var TableColumnMeta = function() {

};

/**
 * Query the database with a specific sql command for matching rows. Those
 * will be returned in an array.
 * 
 * @returns {Boolean} Did an error occur?
 * @returns {Object}[] The results of the query as array
 */
BaseSqlDatabaseDriver.prototype.query = function(sql, parameters) {
    throw new Error('Abstract method is not, yet implemented in: ' + this.logging_prefix);
};

/**
 * Execute an operation on the database. The return value is the amount of affected rows
 * or the last insert id. 
 * 
 * @returns {Boolean} Did an error occur?
 * @returns {Number} Affected rows or last insert id
 */
BaseSqlDatabaseDriver.prototype.execute = function(sql, parameters) {
    throw new Error('Abstract method is not, yet implemented in: ' + this.logging_prefix);
};

/**
 * Retrieve the meta data about all columns in that table.
 * 
 * @returns {Boolean} Did an error occur?
 * @returns {TableColumnMeta}[]
 */
BaseSqlDatabaseDriver.prototype.getTableMeta = function(table_name) {
    throw new Error('Abstract method is not, yet implemented in: ' + this.logging_prefix);
};

/**
 * Escape the value in such way, that it can be inserted in any sql query
 * without sql injection issues
 * 
 * @param {Number|String|Boolean}
 *      [value]
 * @return {String}
 */
BaseSqlDatabaseDriver.prototype.escapeValue = function(value) {
    throw new Error('Abstract method is not, yet implemented in: ' + this.logging_prefix);
};

/**
 * Store the structure (not the data!) of this database to a file.
 * @returns {Boolean} Did an error occur?
 */
BaseSqlDatabaseDriver.prototype.dumpStructureToFile = function(file_name) {
    throw new Error('Abstract method is not, yet implemented in: ' + this.logging_prefix);
};

/**
 * Store the entire database to a file.
 * @returns {Boolean} Did an error occur?
 */
BaseSqlDatabaseDriver.prototype.dumpDatabaseToFile = function(file_name) {
    throw new Error('Abstract method is not, yet implemented in: ' + this.logging_prefix);
};

/**
 * Load the database structure from a file. Usually wipes the data.
 * @returns {Boolean} Did an error occur?
 */
BaseSqlDatabaseDriver.prototype.loadStructureFromFile = function(file_name) {
    throw new Error('Abstract method is not, yet implemented in: ' + this.logging_prefix);
};

/**
 * Load the entire database from a file.
 * @returns {Boolean} Did an error occur?
 */
BaseSqlDatabaseDriver.prototype.loadDatabaseFromFile = function(file_name) {
    throw new Error('Abstract method is not, yet implemented in: ' + this.logging_prefix);
};

/**
 * Converts a given where_condition + where_parameters to proper sql. where_condition may
 * be a string or a criteria.
 * 
 * @param {String|Criteria}
 *      [where_condition=''] The filter condition for the selection. May
 *          contain <code>?</code> characters, which will be replaced
 *          by the escaped values of the <code>where_parameters</code>
 *          array.
 * @param {Array}
 *      [where_parameters=[]] The bound values for the prepared statement
 *      at <pre>where_condition</pre>
 * @returns {Boolean} Did an error occur?
 * @returns {Object}[] The matching rows as Objects
 */
BaseSqlDatabaseDriver.prototype.convertWhereConditionAndParametersToSqlQueryAndParameters = function(where_condition, where_parameters) {
    if (typeof where_condition === 'string') {
        /*
         * If it's just a string and no criteria, just return it properly
         */
        if (where_condition.length > 0) {
            return [false, ' WHERE ' + where_condition, where_parameters];
        }
        
        return [false, '', []];
    }
    
    /*
     * It actually is a criteria. We'll ignore where_parameters in this case.
     */
    var criteria = where_condition;
    
    var sql_string_parts = [];
    var sql_parameters = [];
    var where_parts = criteria.getWhereParts();
    var where_parts_length = where_parts.length;
    
    if (where_parts_length > 0) {
        sql_string_parts.push('WHERE');
    }
    
    for (var i = 0; i < where_parts_length; i++) {
        if (i !== 0) {
            sql_string_parts.push('AND');
        }
        
        var where_part = where_parts[i];
        var key = where_part[0];
        var where_part_operator = where_part[1];
        var value_or_values = where_part[2];
        
        /*
         * FIXME: Escape KEYS!
         */
        sql_string_parts.push('`' + key + '`');
        
        if (where_part_operator === 'IN') {
            sql_string_parts.push('IN');
            var escaped_values = [];
            var values = value_or_values;
            var values_length = values.length;
            if (values_length === 0) {
                /*
                 * We have no values, but an in query -> fail!
                 */
                return [true];
            }
            for (var v = 0; v < values_length; v++) {
                escaped_values.push(this.escapeValue(values[v]));
            }
            sql_string_parts.push('(');
            sql_string_parts.push(escaped_values.join(','));
            sql_string_parts.push(')');
        } else {
            sql_string_parts.push(where_part_operator + ' ? ');
            sql_parameters.push(value_or_values); 
        }
    }
    
    var order_by_parts = criteria.getOrderByParts();
    var order_by_parts_length = order_by_parts.length;
    if (order_by_parts_length > 0) {
        sql_string_parts.push('ORDER BY');
        var order_by_sql = [];
        for (var m = 0; m < order_by_parts_length; m++) {
            order_by_sql.push(order_by_parts[m][0] + ' ' + order_by_parts[m][1]);
        }
        sql_string_parts.push(order_by_sql.join(', '));
    }
    
    var limit = criteria.getLimit();
    var offset = criteria.getOffset();
    
    if (limit !== null || offset !== null) {
        limit = limit || 0;
        offset = offset || 0;
        if (offset === 0) {
            sql_string_parts.push('LIMIT ' + limit);
        } else {
            sql_string_parts.push('LIMIT ' + offset + ', ' + limit);
        }
    }
    
    return [false, ' ' + sql_string_parts.join(' '), sql_parameters];
};

/**
 * Select a set of table rows from the database
 * 
 * @param {String}
 *      table_name Name of the table
 * @param {String|Criteria}
 *      [where_condition=''] The filter condition for the selection. May
 *          contain <code>?</code> characters, which will be replaced
 *          by the escaped values of the <code>where_parameters</code>
 *          array.
 * @param {Array}
 *      [where_parameters=[]] The bound values for the prepared statement
 *      at <pre>where_condition</pre>
 * @returns {Boolean} Did an error occur?
 * @returns {Object}[] The matching rows as Objects
 */
BaseSqlDatabaseDriver.prototype.selectTableRows = function(table_name, where_condition, where_parameters) {
    var that = this;
    return function(cb) {
        var sql_string_parts = ['SELECT * FROM `' + table_name + '`'];
        
        var sql_parameters = [];
        if (where_condition) {
            var converted_criteria_data = that.convertWhereConditionAndParametersToSqlQueryAndParameters(where_condition, where_parameters || []);
            if (converted_criteria_data[0]) {
                cb(true, 'Invalid criteria');
                return ;
            }
            sql_string_parts.push(converted_criteria_data[1]);
            sql_parameters = converted_criteria_data[2];
        }

        that.query(sql_string_parts.join(''), sql_parameters)(function(error, results) {
            cb(error, results || []);
        });        
    };
};

/**
 * Count the matching rows of a table from the database
 * 
 * @param {String}
 *      table_name Name of the table
 * @param {String|Criteria}
 *      [where_condition=''] The filter condition for the selection. May
 *          contain <code>?</code> characters, which will be replaced
 *          by the escaped values of the <code>where_parameters</code>
 *          array.
 * @param {Array}
 *      [where_parameters=[]] The bound values for the prepared statement
 *      at <pre>where_condition</pre>
 * @returns {Boolean} Did an error occur?
 * @returns {Number} The matching rows count
 */
BaseSqlDatabaseDriver.prototype.countTableRows = function(table_name, where_condition, where_parameters) {
    var that = this;
    return function(cb) {
        var sql_string_parts = ['SELECT COUNT(*) bsqldbdrv__count FROM `' + table_name + '`'];

        var sql_parameters = [];
        if (where_condition) {
            var converted_criteria_data = that.convertWhereConditionAndParametersToSqlQueryAndParameters(where_condition, where_parameters || []);
            if (converted_criteria_data[0]) {
                cb(true, 'Invalid criteria');
                return ;
            }
            sql_string_parts.push(converted_criteria_data[1]);
            sql_parameters = converted_criteria_data[2];
        }

        that.query(sql_string_parts.join(''), sql_parameters)(function(error, results) {
            if (!error && results.length) {
                cb(false, parseInt(results[0]['bsqldbdrv__count'], 10));
            } else {
                cb(true, 0);
            }
        });        
    };
};



/**
 * Updates a set fo table rows
 * 
 * @param {String}
 *      table_name Name of the table
 * @param {Object}
 *      values A key-value object, which holds all table columns which should
 *      be updated with a new value.
 * @param {String|Criteria}
 *      [where_condition=''] The filter conidition for the selection. May
 *          contain <code>?</code> characters, which will be replaced
 *          by the escaped values of the <code>where_parameters</code>
 *          array.
 * @param {Array}
 *      [where_parameters=[]] The bound values for the prepared statement
 *      at <pre>where_condition</pre>
 *      
 * @returns {Boolean} Did an error occur?
 * @returns {Number} The amount of affected rows
 */
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
        
        if (where_condition) {
            var converted_criteria_data = that.convertWhereConditionAndParametersToSqlQueryAndParameters(where_condition, where_parameters || []);
            if (converted_criteria_data[0]) {
                cb(true, 'Invalid criteria');
                return ;
            }
            sql_string_parts.push(converted_criteria_data[1]);
            where_parameters = converted_criteria_data[2];
        }

        var where_parameters_length = where_parameters.length;
        for (var i = 0; i < where_parameters_length; i++) {
            sql_parameters.push(where_parameters[i]);
        }
        
        that.execute(sql_string_parts.join(''), sql_parameters)(function(error, affected_rows) {
            cb(error, affected_rows);
        });        
    };
};

/**
 * Updates a set fo table rows
 * 
 * @param {String}
 *      table_name Name of the table
 * @param {Object}
 *      values A key-value object, which holds all table columns which should
 *      be set.
 *      
 * @returns {Boolean} Did an error occur?
 * @returns {Number} The last_insert_id (if the table has one)
 */
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

/**
 * Removes a set fo table rows
 * 
 * @param {String}
 *      table_name Name of the table
 * @param {String|Criteria}
 *      [where_condition=''] The filter condition for the selection. May
 *          contain <code>?</code> characters, which will be replaced
 *          by the escaped values of the <code>where_parameters</code>
 *          array.
 * @param {Array}
 *      [where_parameters=[]] The bound values for the prepared statement
 *      at <pre>where_condition</pre>
 *      
 * @returns {Boolean} Did an error occur?
 * @returns {Number} The amount of affected rows
 */
BaseSqlDatabaseDriver.prototype.deleteTableRows = function(table_name, where_condition, where_parameters) {
    var that = this;
    return function(cb) {
        var sql_parameters = [];

        var sql_string_parts = ['DELETE FROM `' + table_name + '`'];

        if (where_condition) {
            var converted_criteria_data = that.convertWhereConditionAndParametersToSqlQueryAndParameters(where_condition, where_parameters || []);
            if (converted_criteria_data[0]) {
                cb(true, 'Invalid criteria');
                return ;
            }
            sql_string_parts.push(converted_criteria_data[1]);
            sql_parameters = converted_criteria_data[2];
        }

        that.execute(sql_string_parts.join(''), sql_parameters)(function(error, affected_rows) {
            cb(error, affected_rows);
        });        
    };
};

/**
 * Shuts down the database driver and closes the client connection
 */
BaseSqlDatabaseDriver.prototype.shutdown = function() {
    return function(cb) {
        cb();
    };
};

/**
 * Create a new table in the database.
 * 
 * @param {String} table_name
 * @param {TableColumnMeta}[] The field_options for the table's columns
 * 
 * @returns {Boolean} Did an error occur?
 */
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

/**
 * Drops a table from the database.
 * 
 * @param {String} table_name
 * 
 * @returns {Boolean} Did an error occur?
 */
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

/**
 * Creates a new column in a table.
 * 
 * @param {String} table_name
 * @param {String} field_name
 * @param {TableColumnMeta} field_options
 * 
 * @returns {Boolean} Did an error occur?
 */
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

/**
 * Alters a column of a table. All field_options must be set, missing ones will
 * usually be removed.
 * 
 * @param {String} table_name
 * @param {String} field_name
 * @param {TableColumnMeta} field_options
 * 
 * @returns {Boolean} Did an error occur?
 */
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

/**
 * Drops a field from the database table.
 * 
 * @param {String} table_name
 * @param {String} field_name
 * 
 * @returns {Boolean} Did an error occur?
 */
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
