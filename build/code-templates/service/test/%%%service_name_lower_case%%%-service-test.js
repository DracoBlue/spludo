require('%%%spludo_directory%%%/core');

var vows = require("vows");
var assert = require("assert");

vows.describe("services").addBatch({
    
    "%%%service_name%%%Service": {
    
        'topic': function() {
            bootstrap_manager.whenLoaded(this.callback);        
        },
    
        createUpdateDelete: {
            'topic': function() {
                var that = this;
                var %%%service_name_lower_case%%%_service = service_manager.get('%%%service_name%%%');
        
                var test_data_key = 'name';
                var test_data_key_getter = 'getName';
                var test_data_initial_value = 'MyName';
                var test_data_updated_value = 'MyUpdatedName';
    
                var %%%service_name_lower_case%%%_id = null;
                var %%%service_name_lower_case%%% = null;
                chain(function(chain_cb) {
                    /*
                     * Let's create a new %%%service_name_lower_case%%%
                     */
                    var creation_parameters = {};
                    creation_parameters[test_data_key] = test_data_initial_value;
    
                    %%%service_name_lower_case%%%_service.create%%%service_name%%%(function(error, new_%%%service_name_lower_case%%%_id) {
                        assert.equal(error, false);
                        %%%service_name_lower_case%%%_id = new_%%%service_name_lower_case%%%_id;
                        chain_cb();
                    }, creation_parameters);
                }, function(chain_cb) {
                    /*
                     * Now let's try to find the created one again
                     */
                    %%%service_name_lower_case%%%_service.get%%%service_name%%%ById(function(found_%%%service_name_lower_case%%%) {
                        assert.equal(typeof %%%service_name_lower_case%%% !== 'undefined', true);
                        %%%service_name_lower_case%%% = found_%%%service_name_lower_case%%%;
                        assert.equal(%%%service_name_lower_case%%%[test_data_key_getter](), test_data_initial_value);
                        chain_cb();
                    }, %%%service_name_lower_case%%%_id);
                }, function(chain_cb) {
                    /*
                     * Now let's update it
                     */
                    var update_parameters = {};
                    update_parameters[test_data_key] = test_data_updated_value;
    
                    %%%service_name_lower_case%%%_service.update%%%service_name%%%(function(error, affected_rows) {
                        assert.equal(error, false);
                        assert.equal(affected_rows, 1);
                        chain_cb();
                    }, %%%service_name_lower_case%%%, update_parameters);
                }, function(chain_cb) {
                    /*
                     * Now let's see if we find that row again, with new
                     * values
                     */
                    %%%service_name_lower_case%%%_service.get%%%service_name%%%ById(function(found_%%%service_name_lower_case%%%) {
                        assert.equal(typeof found_%%%service_name_lower_case%%% !== 'undefined', true);
                        assert.equal(found_%%%service_name_lower_case%%%[test_data_key_getter](), test_data_updated_value);
                        chain_cb();
                    }, %%%service_name_lower_case%%%_id);
                }, function(chain_cb) {
                    /*
                     * Let's remove the created one now!
                     */
                    %%%service_name_lower_case%%%_service.delete%%%service_name%%%(function(error, affected_rows) {
                        assert.equal(error, false);
                        assert.equal(affected_rows, 1);
                        chain_cb();
                    }, %%%service_name_lower_case%%%);
                }, function(chain_cb) {
                    /*
                     * Now let's see if it's removed!
                     */
                    %%%service_name_lower_case%%%_service.get%%%service_name%%%ById(function(found_%%%service_name_lower_case%%%) {
                        assert.equal(typeof found_%%%service_name_lower_case%%%, 'undefined');
                        chain_cb();
                    }, %%%service_name_lower_case%%%_id);
                }, function(chain_cb) {
                    /*
                     * Now let's see if an update doesn't update anything
                     */
                    var update_parameters = {};
                    update_parameters[test_data_key] = test_data_initial_value;
    
                    %%%service_name_lower_case%%%_service.update%%%service_name%%%(that.callback, %%%service_name_lower_case%%%, update_parameters);
                });
            },
            'was the removal successful': function(error, affected_rows) {
                assert.isTrue(!error);
                assert.equal(affected_rows, 0);
            }
        }  
    }
}).export(module);