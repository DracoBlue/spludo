/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

new TestSuite("core.contexttoolkit.Cookies", {

    settingCookiesWithNoLifetime: function() {
        var context = {};
        ContextToolkit.setCookie(context, "key", "value");
        equal(context.cookies["key"], "value");
    },

    settingCookiesMultipleTimes: function() {
        var context = {};
        ContextToolkit.setCookie(context, "old_key", "value");
        ContextToolkit.setCookie(context, "key", "value");
        equal(context.cookies["key"], "value");
    },

    tryingToApplyCookiesToHeaders: function() {
        var context = {};
        ContextToolkit.setCookie(context, "key", "value");
        ContextToolkit.setCookie(context, "key2", "value2");

        ContextToolkit.applyCookiesToHeaders(context);

        equal(context.headers["Set-Cookie"].indexOf("key="), 0);
    }

});
