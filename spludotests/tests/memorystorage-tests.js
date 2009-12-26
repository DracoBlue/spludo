/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

new TestSuite("Memory Storage", {

    simpleSetAndGet: function() {
        var storage = new MemoryStorage("simple_set_and_get_storage");
        equal(storage.has("key"), false);
        equal(storage.get("key") || true, true);
        equal(storage.get("key") || false, false);
        equal(storage.get("key") || null, null);
        equal(storage.get("key"), undefined);
    },

    setNullAsValue: function() {
        var storage = new MemoryStorage("set_null_as_value_storage");
        equal(storage.has("key"), false);
        equal(storage.get("key") || undefined, undefined);
        storage.set("key",null);
        equal(storage.has("key"), true);
        equal(storage.get("key"), null);
        storage.remove("key",null);
        equal(storage.has("key"), false);
        equal(storage.get("key") || undefined, undefined);
    }

});
