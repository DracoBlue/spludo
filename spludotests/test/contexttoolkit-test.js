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

vows.describe("core.contexttoolkit").addBatch({
    
    "Cookies": {
        
        'topic': function() {
            bootstrap_manager.whenLoaded(this.callback);
        },
        
        settingCookiesWithNoLifetime: function() {
            var context = {};
            ContextToolkit.setCookie(context, "key", "value");
            assert.equal(context.cookies["key"], "value");
        },
    
        settingCookiesMultipleTimes: function() {
            var context = {};
            ContextToolkit.setCookie(context, "old_key", "value");
            ContextToolkit.setCookie(context, "key", "value");
            assert.equal(context.cookies["key"], "value");
        },
    
        tryingToApplyCookiesToHeaders: function() {
            var context = {};
            ContextToolkit.setCookie(context, "key", "value");
            ContextToolkit.setCookie(context, "key2", "value2");
    
            ContextToolkit.applyCookiesToHeaders(context);
    
            assert.equal(context.headers["Set-Cookie"].indexOf("key="), 0);
        }
        
    }

}).export(module);
