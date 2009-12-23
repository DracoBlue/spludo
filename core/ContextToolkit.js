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
        context.cookies_path = context.cookies_path || {};
        context.cookies_life_time = context.cookies_life_time || {};
        context.cookies[key] = value;
        if (typeof life_time !== "undefined") {
            if (life_time !== null) {
                if (life_time === 0) {
                    /*
                     * This is not a browser session cookie
                     */
                    context.cookies_life_time[key] = "0";
                } else {
                    if (life_time < 0) {
                        /*
                         * That cookie expired already!
                         */
                        context.cookies_life_time[key] = "Tue, 23-May-1985 17:05:20 GMT";
                    } else {
                        /*
                         * That cookie expired already!
                         */
                        var life_time_date = new Date();

                        /*
                         * Now let's calculate the difference to the current
                         * date.
                         */
                        life_time_date.setTime(life_time_date.getTime() + life_time);

                        /*
                         * This is not 100% "%a, %d-%b-%Y %T GMT" because it has
                         * GMT-600 for instance, but it seems to work.
                         */
                        context.cookies_life_time[key] = life_time_date.toString();
                    }
                }
            }

            if (typeof path !== "undefined") {
                context.cookies_path[key] = path;
            }
        }
    },

    removeCookie: function(context, key, path) {
        this.setCookie(context, key, "", -3600 * 24, path);
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

        var cookies = context.cookies;

        var set_cookie_headers = [];

        for (key in cookies) {
            var set_cookie_string = encodeURIComponent(key) + "=" + encodeURIComponent(JSON.stringify(cookies[key]));
            if (typeof context.cookies_life_time[key] !== "undefined") {
                set_cookie_string = set_cookie_string + "; expires=" + context.cookies_life_time[key];
            }
            if (typeof context.cookies_path[key] !== "undefined") {
                set_cookie_string = set_cookie_string + "; path=" + context.cookies_path[key];
            }
            set_cookie_headers.push(set_cookie_string);
        }

        /*
         * Even though http://tools.ietf.org/html/rfc2109#page-4 says that it's
         * possible to seperate SetCookie with ',' it does not work. So we are
         * doing this evil evil hack.
         * 
         * Yes I am serious. This: .join("\nSet-Cookie: ") is just for that
         * hack! :(
         */
        context.headers["Set-Cookie"] = set_cookie_headers.join("\nSet-Cookie: ");

    }

};