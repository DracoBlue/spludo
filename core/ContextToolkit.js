/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class A toolkit for convenient functions to work on the context.
 * 
 * @since 0.1
 * @author DracoBlue
 */
ContextToolkit = {

    setCookie: function(context, key, value, life_time, path) {
        context.cookies = context.cookies || {};
        context.cookies[key] = value;
        if (typeof life_time !== "undefined") {
            if (life_time !== null) {
                context.cookies_life_time = context.cookies_life_time || {};
                context.cookies_life_time[key] = life_time;
            }

            if (typeof path !== "undefined") {
                context.cookies_path = context.cookies_path || {};
                context.cookies_path[key] = path;
            }
        }
    },

    applyCookiesToHeaders: function(context) {
        if (!context || !context.cookies) {

            /*
             * Ok, we have nothing in the cookies, let's remove the
             * headers['Set-Cookie'] (if it exists)
             */
            if (context && context.headers) {
                delete context.headers["Set-Cookie"];
            }

            return;
        }

        context = context || {};
        context.headers = context.headers || {};

        context.headers["Set-Cookie"] = [];
        for (key in context.cookies) {
            context.headers["Set-Cookie"]
                    .push(encodeURIComponent(key) + "=" + encodeURIComponent(context.cookies[key]));
        }

    }

};