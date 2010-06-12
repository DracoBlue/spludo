/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

new TestSuite("core.objecttoolkit.setPathValue", {

    testWithNewObject: function() {
        var initial_data = {};
        
        var data = ObjectToolkit.setPathValue(initial_data, ["a", "b", "c"], "hallo");

        equal(typeof data.a, "object");
        equal(typeof data.a.b, "object");
        equal(data.a.b.c, "hallo");
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

        equal(typeof data.a, "object");
        equal(typeof data.a.b, "object");
        equal(data.a.b.c, "hallo");
        
        equal(data.a.f, "hmpf");
        equal(typeof data.a.d, "object");
    }

});

new TestSuite("core.objecttoolkit.getPathValue", {

    testWithNewObject: function() {
        var initial_data = {};
        
        var data = ObjectToolkit.getPathValue(initial_data, ["a", "b", "c"]);

        equal(typeof data, "undefined");
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

        equal(data, "hmpf");
    
    }

});

