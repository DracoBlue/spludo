/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */
require('./../../core');

var vows = require("vows");
var assert = require("assert");

vows.describe("core.session").addBatch({
    
    "CookieSessionManager": {
        
        'topic': function() {
            bootstrap_manager.whenLoaded(this.callback);
        },
        
        settingGettingAndRemove: {
            
            'topic': function() {
                var that = this;
                var session = {};
                session.name = "test";
                session.value = "value";
        
                session_manager.setSession("testid", session)(function() {
                    delete session.name;
                    delete session.value;
                    delete session;
        
                    session_manager.getSession("testid")(function(get_session) {
                        assert.equal(get_session.name, "test");
                        assert.equal(get_session.value, "value");
                        
                        session_manager.removeSession("testid")(function() {
                            session_manager.getSession("testid")(function(non_existant_session) {
                                that.callback(null, !non_existant_session);
                            });
                        });
                    });
                });
            },
            
            'test_if_session_is_really_removed' : function(res, session_did_not_exist) {
                assert.isTrue(session_did_not_exist, "undefined", "the session testid should not exist!");
            }
        }
    }

}).export(module);
