/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class A toolkit for convenient functions to work on the context.
 */
ContextToolkit = {

    /**
     * Set a cookie.
     * 
     * @param {Context}
     *            context Specifies the context to set this cookie for.
     * @param {String}
     *            key Set the key for the cookie. Must be a string.
     * @param {String|Object|Array|Number}
     *            value Set value of the cookie. May even be an Object. Will be
     *            encoded to JSON.
     * @param {Number}
     *            [life_time=null] Set the amount of seconds this cookie is
     *            meant to be alive. Can be 0 to indicate that this is set for
     *            the lifetime of the browser session only.
     * @param {String}
     *            [path=null] Set the path for the cookie.
     */
    setCookie: function(context, key, value, life_time, path) {
        context.cookies = context.cookies || {};
        context.cookies_path = context.cookies_path || {};
        context.cookies_life_time = context.cookies_life_time || {};
        context.cookies[key] = value;

        /*
         * If this is a clean cookie, we have to remove it from clean cookies,
         * so we don't forget to send it!
         */
        if (context.clean_cookies && context.clean_cookies[key]) {
            delete context.clean_cookies[key];
        }

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

    /**
     * Remove a cookie. This is achieved by setting the lifetime to -1.
     * 
     * @param {Context}
     *            context Specifies the context to remove this cookie from.
     * @param {String}
     *            key Set the key for the cookie. Must be a string.
     * @param {String}
     *            [path=null] Set the path for the cookie.
     */
    removeCookie: function(context, key, path) {
        this.setCookie(context, key, "", -1, path);
    },

    /**
     * Apply the request-headers to a context. This will for instance set the
     * Context#clean_cookies and Context#cookies property.
     * 
     * @param {Context}
     *            context The context for the operation.
     * @param {Object}
     *            headers The request headers (usually taken from
     *            http.ServerRequest.headers)
     */
    applyRequestHeaders: function(context, headers) {
        context.request_headers = headers;

        /*
         * If we have no request cookie, we don't need this stuff.
         */
        if (typeof headers["cookie"] === "undefined") {
            return;
        }

        context.clean_cookies = context.clean_cookies || {};
        context.cookies = context.cookies || {};
        var raw = headers["cookie"].split("; ");

        var cookie_key = null;
        var cookie_value = null;

        for (var i in raw) {
            /*
             * Transform (raw_line): test1=%7B%22key%22%3A%22value%22%7D To
             * (cookie_key: cookie_value): "test1": { "key": "value" }
             */
            var raw_line = raw[i].split("=");
            try {
                cookie_key = decodeURIComponent(raw_line[0]);
                cookie_value = raw_line[1] || "";
                cookie_value = decodeURIComponent(raw_line.splice(1).join("="));
                
                context.clean_cookies[cookie_key] = JSON.parse(cookie_value, true);
                context.cookies[cookie_key] = context.clean_cookies[cookie_key];
            } catch (e) {
                /*
                 * If there is an exception with an item -> ignore.
                 */
            }
        }
    },

    /**
     * Apply the cookies, which are currently available on the context, to the
     * correct headers. This is usually triggered by the application, which
     * delivers the response for the context.
     * 
     * @param {Context}
     *            context The context for the operation.
     */
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

        for (var key in cookies) {
            /*
             * We did not received that cookie as request cookie, or at least
             * changed it afterwards.
             */
            if (!context.clean_cookies || typeof context.clean_cookies[key] === "undefined") {

                var set_cookie_string = encodeURIComponent(key) + "=";
                set_cookie_string = set_cookie_string + encodeURIComponent(JSON.stringify(cookies[key]));

                if (typeof context.cookies_life_time[key] !== "undefined") {
                    set_cookie_string = set_cookie_string + "; expires=" + context.cookies_life_time[key];
                }
                if (typeof context.cookies_path[key] !== "undefined") {
                    set_cookie_string = set_cookie_string + "; path=" + context.cookies_path[key];
                }
                set_cookie_headers.push(set_cookie_string);
            }
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

    },

    /**
     * Redirect to a different url.
     * 
     * @param {Context}
     *            context The context for the operation.
     * @param {String}
     *            path The path where to redirect to.
     */
    applyRedirect: function(context, path) {
        context.status = 302;
        context.headers["Location"] = path;
    }
};
