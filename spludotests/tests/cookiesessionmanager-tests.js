/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

new TestSuite("core.session.CookieSessionManager", {

    settingGettingAndRemove: function() {
        var session = {};
        session.name = "test";
        session.value = "value";

        return function(cb) {
            session_manager.setSession("testid", session)(function() {
                delete session.name;
                delete session.value;
                delete session;
    
                session_manager.getSession("testid")(function(get_session) {
                    equal(get_session.name, "test");
                    equal(get_session.value, "value");
                    
                    session_manager.removeSession("testid")(function() {
                        session_manager.getSession("testid")(function(non_existant_session) {
                            if (non_existant_session) {
                                ok(false, "the session testid should not exist!");
                            }
                            cb();
                        });
                    });
                });
            });
        };
    }

});
