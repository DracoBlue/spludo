/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

new TestSuite("SessionManager", {

    settingGettingAndRemove: function() {
        var session = {};
        session.name = "test";
        session.value = "value";

        session_manager.setSession("testid", session);
        
        delete session.name;
        delete session.value;
        delete session;

        var get_session = session_manager.getSession("testid");
        equal(get_session.name, "test");
        equal(get_session.value, "value");
        
        session_manager.removeSession("testid");
        
        try {
            session_manager.getSession("testid");
            fail("the session testid should not exist!");
        } catch (e) {
            
        }
    }

});
