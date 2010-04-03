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
 * 
 * @since 0.1
 * @author dracoblue
 */
BootstrapManager = function() {
    var self = this;
    
    this.mandatory_elements_missing_count = 0;
    this.mandatory_elements_missing = {};
    this.token_name_map = {};
    
    this.taken_tokens = {};
    
    this.event_emitter = new events.EventEmitter();
    
    this.event_emitter.addListener("finishPart", function() {
        self.info("Event: finishPart");
        self.mandatory_elements_missing_count--;

        self.trace("There are: " + self.mandatory_elements_missing_count + " to go");
        if (self.mandatory_elements_missing_count === 0) {
            self.info("Event: end");
            self.event_emitter.emit("end");
        }
    });
};

extend(true, BootstrapManager.prototype, Logging.prototype);

BootstrapManager.prototype.createToken = function() {
    this.info("createToken");
    
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
    this.info("createMandatoryElement:" +name);
    var token = this.createToken();
    
    this.mandatory_elements_missing[token] = true;
    this.mandatory_elements_missing_count++;
    
    this.token_name_map[token] = name;
    
    return token;
};

BootstrapManager.prototype.finishMandatoryElement = function(token) {
    this.info("finishMandatoryElement: " +this.token_name_map[token]);
    if (typeof this.mandatory_elements_missing[token] === "undefined") {
        throw new Error("Cannot finish mandatory element for token " + token + ", because it is not missing.");
    }
    
    delete this.mandatory_elements_missing[token];
    
    this.event_emitter.emit("finishPart", token);
};
