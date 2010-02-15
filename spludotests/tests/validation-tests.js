/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

new TestSuite("core.validation.Validation", {

   exportOnlyValidatedStrings: function() {
        var val = new Validation();
        val.add("key1", "string");
        val.add("key2", "string");

        var params = {
            "key1": "123",
            "key2": "234",
            "key3": "345"
        }

        var errors = val.execute(params);
        
        equal(errors.length, 0);

        var validated_values = val.getValidatedValues();
        
        equal(validated_values["key1"], "123");
        equal(validated_values["key2"], "234");
        equal(typeof validated_values["key3"], "undefined");
    },

    limitsForStrings: function() {
        var val = new Validation();
        val.add("key1", "string", {"min": 1, "max": 9});
        val.add("key2", "string", {"min": 4, "max": 2});

        var params = {
            "key1": "123456789",
            "key2": "234",
            "key3": "345"
        }

        var errors = val.execute(params);
        
        equal(errors.length, 1);
        
        var validated_values = val.getValidatedValues();
        
        equal(validated_values["key1"], "123456789");
        equal(typeof validated_values["key2"], "undefined");
        equal(typeof validated_values["key3"], "undefined");
        
        equal(errors[0][0], "key2");
        equal(errors[0][1].length, 2);

        var max_and_min = (errors[0][1][0] === "min" || errors[0][1][1] === "max");
        var max_and_min = max_and_min || (errors[0][1][0] === "max" || errors[0][1][1] === "min");

        if (!max_and_min) {
            fail("the errors should contain min or max as first elements.");
        }
    },
   
    emptyValidation: function() {
        var val = new Validation();

        var params = {
            "key1": "123456789",
            "key2": "234",
            "key3": "345"
        }

        var errors = val.execute();

        equal(errors.length, 0);
        
        var validated_values = val.getValidatedValues();

        equal(typeof validated_values["key1"], "undefined");
        equal(typeof validated_values["key2"], "undefined");
        equal(typeof validated_values["key3"], "undefined");

    },
    
    validationMessages: function() {
        var val = new Validation();
        val.add("key1", "string", {"min":2},{"min":"lalala"});

        var params = {
            "key1": "1",
        }

        var errors = val.execute(params);
        
        equal(errors.length, 1);
        
        var validated_values = val.getValidatedValues();
        
        equal(typeof validated_values["key1"], "undefined");

        equal(errors[0][0], "key1");
        equal(errors[0][1].length, 1);
        equal(errors[0][1][0], "min");
        equal(errors[0][2].length, 1);
        equal(errors[0][2][0], "lalala");

        // var sys = require("sys");
        // sys.debug(sys.inspect(errors));
    }

});
