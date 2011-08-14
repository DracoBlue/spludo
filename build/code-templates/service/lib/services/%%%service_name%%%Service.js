/**
 * @module %%%service_name%%%Service
 * 
 * @extends Logging
 */
var %%%service_name%%%Service = function() {
    this.trace('initialize', arguments);
    this.addTracing();
    var database_connection_name = config.get('%%%service_name_lower_case%%%', {}).database_connection;
    this.database_connection = database_manager.getDatabase(database_connection_name);
};

extend(true, %%%service_name%%%Service.prototype, Logging.prototype);
%%%service_name%%%Service.prototype.logging_prefix = '%%%service_name%%%Service';

var assert = require('assert');

var %%%service_name%%% = function(initial_values) {
    this.values = initial_values || {};
};
%%%service_object_definition%%%

%%%service_name%%%Service.prototype.get%%%service_name%%%ById = function(cb, id) {
    assert.equal(typeof cb, 'function', 'First parameter must be a callback!');
    
    this.database_connection.selectTableRows('%%%database_table_name%%%', '%%%id_key%%%  = ?', [id])(function(error, results) {
        if (results.length === 0) {
            cb();
        } else {
            cb(new %%%service_name%%%(results[0]));
        }
    });
};

%%%service_name%%%Service.prototype.update%%%service_name%%% = function(cb, %%%service_name_lower_case%%%, values) {
    assert.equal(typeof cb, 'function', 'First parameter must be a callback!');
    
    this.database_connection.updateTableRows('%%%database_table_name%%%', values, '%%%id_key%%%  = ?', [%%%service_name_lower_case%%%.getId()])(function(error, affected_rows) {
        cb(error, affected_rows);
    });
};

%%%service_name%%%Service.prototype.delete%%%service_name%%% = function(cb, %%%service_name_lower_case%%%) {
    assert.equal(typeof cb, 'function', 'First parameter must be a callback!');
    
    this.database_connection.deleteTableRows('%%%database_table_name%%%', '%%%id_key%%%  = ?', [%%%service_name_lower_case%%%.getId()])(function(error, affected_rows) {
        cb(error, affected_rows);
    });
};

%%%service_name%%%Service.prototype.create%%%service_name%%% = function(cb, values) {
    assert.equal(typeof cb, 'function', 'First parameter must be a callback!');
    
    this.database_connection.createTableRow('%%%database_table_name%%%', values)(function(error, last_insert_id) {
        cb(error, last_insert_id);
    });
};

/*
 * Initialize the Module
 */
module.exports = new %%%service_name%%%Service();