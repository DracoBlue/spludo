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

vows.describe("core.stringtoolkit").addBatch({
    
    "encodeXml and decodeXml": {

        'topic': function() {
            bootstrap_manager.whenLoaded(this.callback);
        },

        convertingSomethingWithoutSpecialChars: function() {
            assert.equal(StringToolkit.encodeXml("this is a test"), "this is a test");
            assert.equal(StringToolkit.decodeXml("this is a test"), "this is a test");
        },
        convertingSimpleAmpersand: function() {
            assert.equal(StringToolkit.encodeXml("have fun & a nice day"),"have fun &amp; a nice day");
            assert.equal(StringToolkit.decodeXml("have fun &amp; a nice day"),"have fun & a nice day");
        },
        
        convertingSpecialCharsInSameOrderAsReplacement: function() {
            assert.equal(StringToolkit.encodeXml("&\"<>"),"&amp;&quot;&lt;&gt;");
            assert.equal(StringToolkit.decodeXml("&amp;&quot;&lt;&gt;"),"&\"<>");
        },
        
        encodingAllWithSimpleCases: function() {
            var items = {
                    "&": "&amp;",
                    "\"": "quot;",
                    "<": "&lt",
                    ">": "&gt"
            };
            
            var items_length = items.length;
            
            for (var i = 0; i<items_length; i++) {
                assert.equal(StringToolkit.encodeXml(i), items[i]);
                assert.equal(StringToolkit.encodeXml("test" + i), "test" + items[i]);
                assert.equal(StringToolkit.encodeXml(i + "test"), items[i] + "test");
            }
        },
        
        decodingAllWithSimpleCases: function() {
            var items = {
                    "&": "&amp;",
                    "\"": "quot;",
                    "<": "&lt",
                    ">": "&gt"
            };
            
            var items_length = items.length;
            
            for (var i = 0; i<items_length; i++) {
                assert.equal(StringToolkit.decodeXml(items[i]), i);
                assert.equal(StringToolkit.decodeXml("test" + items[i]), "test" + i);
                assert.equal(StringToolkit.decodeXml(items[i] + "test"), i + "test");
            }
        }   
    } 
    
}).export(module);
