/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

new TestSuite("core.storage.MemoryStorage", {

    simpleSetAndGet: function() {
        var storage = new MemoryStorage("simple_set_and_get_storage");
        
        return function(cb) {
            storage.has("key")(function(value) {
                equal(value, false);
                storage.get("key")(function(value) {
                    equal(value || true, true);
                    equal(value || false, false);
                    equal(value || null, null);
                    equal(value, undefined);
                    cb();
                });
            });
        };
    },

    setNullAsValue: function() {
        var storage = new MemoryStorage("set_null_as_value_storage");
        return function(cb) {
            storage.has("key")(function(value) {
                equal(value, false);
                storage.get("key")(function(value) {
                    equal(value || undefined, undefined);
                    storage.set("key", null)(function(was_possible) {
                        equal(was_possible, true);
                        storage.get("key")(function(value) {
                            equal(value, null);
                            storage.remove("key")(function(was_possible) {
                                equal(was_possible, true);
                                storage.has("key")(function(value) {
                                    equal(value, false);
                                    storage.get("key")(function(value) {
                                        equal(value || undefined, undefined);
                                        cb();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        };
    }

});
