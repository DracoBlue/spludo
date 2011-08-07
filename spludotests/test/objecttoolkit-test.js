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

vows.describe("core.objecttoolkit").addBatch({
    
    "setPathValue": {

        'topic': function() {
            bootstrap_manager.whenLoaded(this.callback);
        },

        testWithNewObject: function() {
            var initial_data = {};
            
            var data = ObjectToolkit.setPathValue(initial_data, ["a", "b", "c"], "hallo");
    
            assert.equal(typeof data.a, "object");
            assert.equal(typeof data.a.b, "object");
            assert.equal(data.a.b.c, "hallo");
        },
    
        testWithFilledObject: function() {
            var initial_data = {
                "a": {
                    "d": {
                    },
                    "f": "hmpf"
                }
            };
            
            var data = ObjectToolkit.setPathValue(initial_data, ["a", "b", "c"], "hallo");
    
            assert.equal(typeof data.a, "object");
            assert.equal(typeof data.a.b, "object");
            assert.equal(data.a.b.c, "hallo");
            
            assert.equal(data.a.f, "hmpf");
            assert.equal(typeof data.a.d, "object");
        }
    },
    
    "getPathValue": {

        testWithNewObject: function() {
            var initial_data = {};
            
            var data = ObjectToolkit.getPathValue(initial_data, ["a", "b", "c"]);
    
            assert.equal(typeof data, "undefined");
        },
    
        testWithFilledObject: function() {
            var initial_data = {
                "a": {
                    "d": {
                    },
                    "f": "hmpf"
                }
            };
            
            var data = ObjectToolkit.getPathValue(initial_data, ["a", "f"]);
    
            assert.equal(data, "hmpf");
        }
    }
}).export(module);

