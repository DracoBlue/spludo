/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

new TestSuite("datamapper.JsonMapperTests", {

    simpleEncodeDecode: function() {
        var data_mapper = data_mapper_manager.getDataMapper('json');
        
        equal(data_mapper.encode("abcde"), "\"abcde\"");
    },

    expectingAnExceptionOnInvalidJson: function() {
        var data_mapper = data_mapper_manager.getDataMapper('json');
        
        try {
            data_mapper.decode("abcde");
            fail("Should fail, because invalid json!");
        } catch (e) {
            notEqual(e.message.indexOf("Could not decode JSON"), -1, "Should throw something with 'Could not decode JSON'");
        }
    },
    
    simpleEncodeOfUtf8Data: function() {
        var data_mapper = data_mapper_manager.getDataMapper('json');
        
        equal(data_mapper.encode("Dateigröße (in KB)"), "\"Dateigr\\u00f6\\u00dfe (in KB)\"");
        equal(data_mapper.decode("\"Dateigr\\u00f6\\u00dfe (in KB)\""), "Dateigröße (in KB)");
        equal(data_mapper.decode(data_mapper.encode("Dateigröße (in KB)")), "Dateigröße (in KB)");
    }
});
