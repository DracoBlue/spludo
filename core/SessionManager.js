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

    var engine = GLOBAL[options.engine || "MemoryStorage"];
    
    if (typeof options.cookie_path !== "undefined") {
        this.cookie_path = options.cookie_path;
    } else {
        this.cookie_path = null;
    }
    
    if (typeof options.cookie_key !== "undefined") {
        this.cookie_key = options.cookie_key;
    } else {
        this.cookie_key = "s";
    }
    
    this.storage = new engine("session_manager", options.engine_options || {});
};

extend(true, SessionManager.prototype, Logging.prototype);

SessionManager.prototype.removeSession = function(session_id) {
    this.storage.remove(session_id);
    this.info("removeSession: " + session_id);
};

SessionManager.prototype.getSession = function(session_id) {
    var session = this.storage.get(session_id) || null;

    if (session === null) {
        throw new Error("Session for id " + session_id + " not found!");
    }

    return JSON.parse(session);
};

SessionManager.prototype.setSession = function(session_id, session) {
    this.storage.set(session_id, JSON.stringify(session));
};

SessionManager.prototype.createSession = function(session) {
    var session_id = null;

    /*
     * FIXME: This is an ugly solution. Guess what happens if we have lots
     * of session. We need some way better function here.
     */
    while (session_id === null) {
        session_id = new String(Math.floor(Math.random()*999999999));
        if (this.storage.has(session_id)) {
            session_id = null;
        }
    }
    
    this.storage.set(session_id, JSON.stringify(session));
    
    this.info("createSession: " + session_id);

    return session_id;
};


SessionManager.prototype.getCookiePath = function() {
    if (this.cookie_path) {
        return this.cookie_path;
    }
    
    return null;
};

SessionManager.prototype.getCookieKey = function() {
    if (this.cookie_key) {
        return this.cookie_key;
    }
    
    return null;
};
