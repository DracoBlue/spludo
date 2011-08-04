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

vows.describe("core.datamapper").addBatch({
    "JsonMapperTests": {

        'topic': function() {
            bootstrap_manager.whenLoaded(this.callback);
        },

        simpleEncodeDecode: function() {
            var data_mapper = data_mapper_manager.getDataMapper('json');
            
            assert.equal(data_mapper.encodeSync("abcde"), "\"abcde\"");
        },
    
        expectingAnExceptionOnInvalidJson: function() {
            var data_mapper = data_mapper_manager.getDataMapper('json');
            
            try {
                data_mapper.decodeSync("abcde");
                fail("Should fail, because invalid json!");
            } catch (e) {
                assert.notEqual(e.message.indexOf("Could not decode JSON"), -1, "Should throw something with 'Could not decode JSON'");
            }
        },
        
        simpleEncodeOfUtf8Data: function() {
            var data_mapper = data_mapper_manager.getDataMapper('json');
            
            assert.equal(data_mapper.encodeSync("Dateigröße (in KB)"), "\"Dateigröße (in KB)\"");
            assert.equal(data_mapper.decodeSync("\"Dateigr\\u00f6\\u00dfe (in KB)\""), "Dateigröße (in KB)");
            assert.equal(data_mapper.decodeSync(data_mapper.encodeSync("Dateigröße (in KB)")), "Dateigröße (in KB)");
        }
        
    }
}).export(module);
