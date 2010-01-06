/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

new DataMapper("json", {
    "decode": function (value, options) {
        var result = null;
        try {
            result = JSON.parse(value);
        } catch (e) {
            throw new Error("Could not decode JSON-String to object: " + e.message);
        }
        return result;
    },

    "encode": function (value, options) {
        return JSON.stringify(value);
    }
});

new DataMapper("string", {
    "decode": function (value, options) {
        return value;
    },

    "encode": function (value, options) {
        return String(value);
    }
});

new DataMapper("number", {
    "decode": function (value, options) {
        return Number(value);
    },

    "encode": function (value, options) {
        return String(value);
    }
});

