/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class The manager for all registered sessions.
 * 
 * @extends Logging
 * 
 * @since 0.1 
 * @author DracoBlue
 */
SessionManager = function(options) {
    options = options || {};

    if (typeof options.cookie_path !== "undefined") {
        this.cookie_path = options.cookie_path;
    } else {
        this.cookie_path = '/';
    }
    
    if (typeof options.cookie_key !== "undefined") {
        this.cookie_key = options.cookie_key;
    } else {
        this.cookie_key = "s";
    }
    
    var engine = GLOBAL[options.engine || "MemoryStorage"];
    
    this.storage = new engine("session_manager", options.engine_options || {});
};

extend(true, SessionManager.prototype, Logging.prototype);

SessionManager.prototype.removeSession = function(session_id) {
    var self = this;
    return function(cb) {
        self.info("removeSession: " + session_id);
        self.storage.remove(session_id);
        cb();
    };
};

SessionManager.prototype.getSession = function(session_id) {
    var self = this;
    return function(cb) {
        var session = self.storage.get(session_id) || null;

        if (session === null) {
            cb(null);
        } else {
            cb(JSON.parse(session));
        }
    };
};

SessionManager.prototype.setSession = function(session_id, session) {
    var self = this;
    return function(cb) {
        self.storage.set(session_id, JSON.stringify(session));
        cb();
    };
};

SessionManager.prototype.createSession = function(session) {
    var self = this;
    return function(cb) {
        var session_id = null;

        /*
         * FIXME: This is an ugly solution. Guess what happens if we have lots
         * of session. We need some way better function here.
         */
        while (session_id === null) {
            session_id = new String(Math.floor(Math.random()*999999999));
            if (self.storage.has(session_id)) {
                session_id = null;
            }
        }
        
        self.storage.set(session_id, JSON.stringify(session));
        
        self.info("createSession: " + session_id);

        cb(session_id);
    };
};


SessionManager.prototype.initializeWebContextSession = function (context, request) {
    var self = this;
    var session_id = (context.cookies && context.cookies[this.cookie_key]) || null;

    return function(cb) {
        if (session_id) {
            self.getSession(session_id)(function(session) {
                if (session) {
                    context.session = session;
                    cb(session_id);
                } else {
                    /*
                     * Seems like that cookie is invalid by now. Let's remove the
                     * cookie.
                     */
                    ContextToolkit.removeCookie(context, self.cookie_key);
                    cb(null);
                }
            });
        } else {
            cb(null);
        }
    };
};

SessionManager.prototype.finishWebContextSession = function (session_id, context, request) {
    var self = this;
    return function(cb) {
        if (session_id !== context.session_id) {
            session_id = context.session_id;
    
            if (session_id === null) {
                ContextToolkit.removeCookie(context, self.cookie_key);
            } else {
                ContextToolkit.setCookie(context, self.cookie_key, session_id, 0, self.cookie_path);
            }
        }
        cb();
    };
};
