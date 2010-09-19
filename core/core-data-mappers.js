/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

new DataMapper("json", {
    "decodeSync": function (value, options) {
        var result = null;
        try {
            result = JSON.parse(value);
        } catch (e) {
            throw new Error("Could not decode JSON-String to object: " + e.message);
        }
        return result;
    },

    "encodeSync": function (value, options) {
        return JSON.stringify(value);
    },

    "decode": function (value, options) {
        return function(cb) {
            var result = null;
            try {
                result = JSON.parse(value);
            } catch (e) {
                cb(null, "Could not decode JSON-String to object: " + e.message);
                return ;
            }
            cb(result);
        };
    },

    "encode": function (value, options) {
        return function(cb) {
            cb(JSON.stringify(value));
        };
    }
});

new DataMapper("string", {
    "decodeSync": function (value, options) {
        return value;
    },

    "encodeSync": function (value, options) {
        return String(value);
    },

    "decode": function (value, options) {
        return function(cb) {
            cb(value);
        };
    },

    "encode": function (value, options) {
        return function(cb) {
            cb(String(value));
        };
    }
});

new DataMapper("number", {
    "decodeSync": function (value, options) {
        return Number(value);
    },

    "encodeSync": function (value, options) {
        return String(value);
    },

    "decode": function (value, options) {
        return function(cb) {
            cb(Number(value));
        };
    },

    "encode": function (value, options) {
        return function(cb) {
            cb(value);
        };
    }
});

