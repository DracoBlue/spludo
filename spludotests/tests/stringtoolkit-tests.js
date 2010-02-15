/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

new TestSuite("core.stringtoolkit.XmlEncodeDecode", {
    convertingSomethingWithoutSpecialChars: function() {
        equal(StringToolkit.encodeXml("this is a test"), "this is a test");
        equal(StringToolkit.decodeXml("this is a test"), "this is a test");
    },
    convertingSimpleAmpersand: function() {
        equal(StringToolkit.encodeXml("have fun & a nice day"),"have fun &amp; a nice day");
        equal(StringToolkit.decodeXml("have fun &amp; a nice day"),"have fun & a nice day");
    },
    
    convertingSpecialCharsInSameOrderAsReplacement: function() {
        equal(StringToolkit.encodeXml("&\"<>"),"&amp;&quot;&lt;&gt;");
        equal(StringToolkit.decodeXml("&amp;&quot;&lt;&gt;"),"&\"<>");
    },
    
    encodingAllWithSimpleCases: function() {
        var items = {
                "&": "&amp;",
                "\"": "quot;",
                "<": "&lt",
                ">": "&gt"
        }
        
        var items_length = items.length;
        
        for (var i = 0; i<items_length; i++) {
            equal(StringToolkit.encodeXml(i), items[i]);
            equal(StringToolkit.encodeXml("test" + i), "test" + items[i]);
            equal(StringToolkit.encodeXml(i + "test"), items[i] + "test");
        }
    },
    
    decodingAllWithSimpleCases: function() {
        var items = {
                "&": "&amp;",
                "\"": "quot;",
                "<": "&lt",
                ">": "&gt"
        }
        
        var items_length = items.length;
        
        for (var i = 0; i<items_length; i++) {
            equal(StringToolkit.decodeXml(items[i]), i);
            equal(StringToolkit.decodeXml("test" + items[i]), "test" + i);
            equal(StringToolkit.decodeXml(items[i] + "test"), i + "test");
        }
    }     
    
});
