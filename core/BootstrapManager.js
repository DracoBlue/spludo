/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var events = require("events");

/**
 * @class The bootstrap manager. Register to it's end-event, before starting any action on the application!
 * 
 * @extends Logging
 */
BootstrapManager = function() {
    var self = this;
    
    this.mandatory_elements_missing_count = 0;
    this.mandatory_elements_missing = {};
    this.token_name_map = {};
    this.name_token_map = {};
    
    this.taken_tokens = {};
    
    this.event_emitter = new events.EventEmitter();
    
    this.event_emitter.addListener("finishPart", function() {
        self.trace("finishPart");
        self.mandatory_elements_missing_count--;

        self.trace("finishPart", "there are " + self.mandatory_elements_missing_count + " to go");
        if (self.mandatory_elements_missing_count === 0) {
            self.info("All necessary parts loaded.");
            self.event_emitter.emit("end");
        }
    });
};

extend(true, BootstrapManager.prototype, Logging.prototype);

BootstrapManager.prototype.logging_prefix = 'BootstrapManager';

BootstrapManager.prototype.createToken = function() {
    this.trace("createToken", arguments);
    
    var token = false;
    
    while (!token) {
        token = new String(Math.floor(Math.random()*999999999));
        
        if (typeof this.taken_tokens[token] !== "undefined") {
            token = false;
        } else {
            this.taken_tokens[token] = true;
        }
    }
    
    return token;
};

BootstrapManager.prototype.createMandatoryElement = function(name) {
    this.trace("createMandatoryElement", arguments);
    var token = this.createToken();
    
    this.mandatory_elements_missing[token] = true;
    this.mandatory_elements_missing_count++;
    
    this.token_name_map[token] = name;
    this.name_token_map[name] = token;
    
    return token;
};

BootstrapManager.prototype.finishMandatoryElement = function(token) {
    this.trace("finishMandatoryElement", arguments);
    if (typeof this.mandatory_elements_missing[token] === "undefined") {
        throw new Error("Cannot finish mandatory element for token " + token + ", because it is not missing.");
    }
    
    delete this.mandatory_elements_missing[token];
    
    this.event_emitter.emit("finishPart", this.token_name_map[token], token);
};

BootstrapManager.prototype.whenReady = function(parts, callback) {
    this.trace("whenReady", arguments);
    
    var self = this;
    
    var check_if_ready_timer = null;
    
    var parts_length = parts.length;
    var checkIfReadyHandler = function() {
        var tokens_missing = 0;
        var parts_waiting = 0;
        for (var i=0; i<parts_length; i++) {
            if (typeof self.name_token_map[parts[i]] === 'undefined') {
                tokens_missing++;
            } else {
                var part_token = self.name_token_map[parts[i]];
                if (typeof self.mandatory_elements_missing[part_token] !== 'undefined') {
                    parts_waiting++;
                }
            }
        }
        
        if (tokens_missing === 0 && parts_waiting === 0) {
            check_if_ready_timer = null;
            clearInterval(check_if_ready_timer);
            callback();
        } else {
            setTimeout(checkIfReadyHandler, 100);
        }
    };
    
    setTimeout(checkIfReadyHandler, 100);
};
