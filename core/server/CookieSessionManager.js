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
 */
CookieSessionManager = function(options) {
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

extend(true, CookieSessionManager.prototype, Logging.prototype);

CookieSessionManager.prototype.logging_prefix = 'CookieSessionManager';

CookieSessionManager.prototype.removeSession = function(session_id) {
    var self = this;
    self.trace("removeSession", arguments);
    return function(cb) {
        self.storage.remove(session_id)(function() {
            cb();
        });
    };
};

CookieSessionManager.prototype.getSession = function(session_id) {
    var self = this;
    return function(cb) {
        self.storage.get(session_id)(function(session_data) {
            if (!session_data) {
                cb(null);
            } else {
                self.log('getSession found', session_data);
                cb(JSON.parse(session_data));
            }
        });
    };
};

CookieSessionManager.prototype.setSession = function(session_id, session) {
    var self = this;
    return function(cb) {
        self.storage.set(session_id, JSON.stringify(session))(function() {
            cb();
        });
    };
};

CookieSessionManager.prototype.createSession = function(session) {
    var self = this;
    self.trace("createSession", arguments);
    return function(cb) {
        var withUniqueSessionHandler = function(session_id) {
            self.storage.set(session_id, JSON.stringify(session))(function() {
                cb(session_id);
            });
        };
        
        /*
         * FIXME: This is an ugly solution. Guess what happens if we have lots
         * of session. We need some way better function here.
         */
        var tryToFindAnUnusedSessionId = function() {
            var session_id = Math.floor(Math.random()*999999999).toString();
            self.storage.has(session_id)(function(is_in_use) {
                if (is_in_use) {
                    session_id = null;
                    tryToFindAnUnusedSessionId();
                } else {
                    withUniqueSessionHandler(session_id);
                }
            });
            
        };
        
        tryToFindAnUnusedSessionId();
    };
};


CookieSessionManager.prototype.initializeWebContextSession = function (context, request) {
    var self = this;
    var session_id = (context.cookies && context.cookies[this.cookie_key]) || null;

    return function(cb) {
        if (session_id) {
            self.getSession(session_id)(function(session) {
                if (typeof session === 'undefined') {
                    /*
                     * Seems like that cookie is invalid by now. Let's remove the
                     * cookie.
                     */
                    ContextToolkit.removeCookie(context, self.cookie_key);
                    cb(null);
                } else {
                    context.session = session;
                    cb(session_id);
                }
            });
        } else {
            cb(null);
        }
    };
};

CookieSessionManager.prototype.finishWebContextSession = function (session_id, context, request) {
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
