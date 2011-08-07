/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */
require('./../../core');

var vows = require("vows");
var assert = require("assert");

vows.describe("core.storage").addBatch({
    
    "MemoryStorage": {

        'topic': function() {
            bootstrap_manager.whenLoaded(this.callback);
        },
        
        simpleSetAndGet: {
            'topic': function() {
                var that = this;
                var storage = new MemoryStorage("simple_set_and_get_storage");
                storage.has("key")(function(value) {
                    assert.equal(value, false);
                    storage.get("key")(function(value) {
                        that.callback(null, value);
                    });
                });
            },
            
            'returns the proper value': function(res, value) {
                assert.equal(value || true, true);
                assert.equal(value || false, false);
                assert.equal(value || null, null);
                assert.equal(value, undefined);
            }
        },
    
        setNullAsValue: {
            'topic': function() {
                var that = this;
                var storage = new MemoryStorage("set_null_as_value_storage");
                storage.has("key")(function(value) {
                    assert.equal(value, false);
                    storage.get("key")(function(value) {
                        assert.equal(value || undefined, undefined);
                        storage.set("key", null)(function(was_possible) {
                            assert.equal(was_possible, true);
                            storage.get("key")(function(value) {
                                assert.equal(value, null);
                                storage.remove("key")(function(was_possible) {
                                    assert.equal(was_possible, true);
                                    storage.has("key")(function(value) {
                                        assert.equal(value, false);
                                        storage.get("key")(function(value) {
                                            that.callback(null, typeof value);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            },
            'check if it has finally an undefined value': function(res, value_type) {
                assert.equal(value_type, "undefined");
            }
        }
    }

}).export(module);
