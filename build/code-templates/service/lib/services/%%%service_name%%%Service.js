/**
 * @module %%%service_name%%%Service
 * 
 * @extends Logging
 */
extend(true, exports, Logging.prototype);
exports.logging_prefix = '%%%service_name%%%Service';

var assert = require('assert');

var initialized = false;

var %%%service_name%%% = function(initial_values) {
    this.values = initial_values || {};
};
%%%service_object_definition%%%

exports.initialize = function() {
    this.trace('initialize', arguments);
    if (initialized)
    {
        throw new Error('Already initialized!');
    }
    initialized = true;
    this.addTracing();
    var database_connection_name = config.get('%%%service_name_lower_case%%%', {}).database_connection;
    this.database_connection = database_manager.getDatabase(database_connection_name);
};

exports.get%%%service_name%%%ById = function(cb, id) {
    assert.equal(typeof cb, 'function', 'First parameter must be a callback!');
    
    this.database_connection.selectTableRows('%%%database_table_name%%%', '%%%id_key%%%  = ?', [id])(function(error, results) {
        if (results.length === 0) {
            cb();
        } else {
            cb(new %%%service_name%%%(results[0]));
        }
    });
};

exports.update%%%service_name%%% = function(cb, user, values) {
    assert.equal(typeof cb, 'function', 'First parameter must be a callback!');
    
    this.database_connection.updateTableRows('%%%database_table_name%%%', values, '%%%id_key%%%  = ?', [user.getId()])(function(error, affected_rows) {
        cb(error, affected_rows);
    });
};

exports.delete%%%service_name%%% = function(cb, user) {
    assert.equal(typeof cb, 'function', 'First parameter must be a callback!');
    
    this.database_connection.deleteTableRows('%%%database_table_name%%%', '%%%id_key%%%  = ?', [user.getId()])(function(error, affected_rows) {
        cb(error, affected_rows);
    });
};

exports.create%%%service_name%%% = function(cb, values) {
    assert.equal(typeof cb, 'function', 'First parameter must be a callback!');
    
    this.database_connection.createTableRow('%%%database_table_name%%%', values)(function(error, last_insert_id) {
        cb(error, last_insert_id);
    });
};

/*
 * Initialize the Module
 */
exports.initialize();
