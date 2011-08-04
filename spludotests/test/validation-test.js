/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */
var vows = require("vows");
var assert = require("assert");

require('./../../core');

vows.describe("core.validation").addBatch({
    
    "Validation": {

        'topic': function() {
            bootstrap_manager.whenLoaded(this.callback);
        },
        
       exportOnlyValidatedStrings: {
           'topic': function() {
               var that = this;
               var val = new Validation();
               val.add("key1", "string");
               val.add("key2", "string");
       
               var params = {
                   "key1": "123",
                   "key2": "234",
                   "key3": "345"
               };
       
               val.execute(params)(function(errors) {
                   that.callback(null, val, errors);
               });
           },

           'should return only the validated ones': function(res, val, errors) {
               assert.equal(errors.length, 0);
               
               var validated_values = val.getValidatedValues();
               
               assert.equal(validated_values["key1"], "123");
               assert.equal(validated_values["key2"], "234");
               assert.equal(typeof validated_values["key3"], "undefined");
           }
       },
    
        limitsForStrings: {
            'topic': function() {
                var that = this;
                var val = new Validation();
                val.add("key1", "string", {"min": 1, "max": 9});
                val.add("key2", "string", {"min": 4, "max": 2});
        
                var params = {
                    "key1": "123456789",
                    "key2": "234",
                    "key3": "345"
                };
                
                val.execute(params)(function(errors) {
                    that.callback(null, val, errors);
                });                
            },
            
            'should only return those strings with proper size': function(res, val, errors) {
                assert.equal(errors.length, 1);
                
                var validated_values = val.getValidatedValues();
                
                assert.equal(validated_values["key1"], "123456789");
                assert.equal(typeof validated_values["key2"], "undefined");
                assert.equal(typeof validated_values["key3"], "undefined");
                
                assert.equal(errors[0][0], "key2");
                assert.equal(errors[0][1].length, 2);
                
                var max_and_min = (errors[0][1][0] === "min" || errors[0][1][1] === "max");
                var max_and_min = max_and_min || (errors[0][1][0] === "max" || errors[0][1][1] === "min");

                assert.equal(max_and_min, true, 'The errors should contain min or max as first elements.');
            }
        },
       
        emptyValidation: {
            'topic': function() {
                var that = this;
                var val = new Validation();
                val.execute()(function(errors) {
                    that.callback(null, val, errors);
                });                
            },
            
            'should return nothing at all': function(res, val, errors) {
                assert.equal(errors.length, 0);
                
                var validated_values = val.getValidatedValues();
        
                assert.equal(typeof validated_values["key1"], "undefined");
                assert.equal(typeof validated_values["key2"], "undefined");
                assert.equal(typeof validated_values["key3"], "undefined");
            }
        },
        
        validationMessages: {
            'topic': function() {
                var that = this;
                var val = new Validation();
                val.add("key1", "string", {"min":2},{"min":"lalala"});
        
                var params = {
                    "key1": "1"
                };
                
                val.execute(params)(function(errors) {
                    that.callback(null, val, errors);
                });
            },
            
            'give proper validation messages': function(res, val, errors) {
                assert.equal(errors.length, 1);
                
                var validated_values = val.getValidatedValues();
                
                assert.equal(typeof validated_values["key1"], "undefined");
        
                assert.equal(errors[0][0], "key1");
                assert.equal(errors[0][1].length, 1);
                assert.equal(errors[0][1][0], "min");
                assert.equal(errors[0][2].length, 1);
                assert.equal(errors[0][2][0], "lalala");
            }
        }
    
    }

}).export(module);
