/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class The manager for all registered validators.
 * 
 * @extends Logging
 */
ValidatorManager = function() {
    this.validators = {};
};

extend(true, ValidatorManager.prototype, Logging.prototype);

ValidatorManager.prototype.logging_prefix = 'ValidatorManager';

ValidatorManager.prototype.addValidator = function(name, validator) {
    this.trace("addValidator", arguments);
    this.validators[name] = validator;
};

ValidatorManager.prototype.getValidator = function(name) {
    if (this.validators[name]) {
        return this.validators[name];
    }

    throw new Error("Validator for name " + name + " not found!");
};

ValidatorManager.prototype.shutdown = function() {
    this.trace("shutdown", arguments);
    for (name in this.validators) {
        /*
         * Check wether this validator has a shutdown method.
         */
        if (typeof this.validators[name].shutdown === "function") {
            try {
                this.validators[name].shutdown();
            } catch (e) {
                this.warn("Exception when trying to shutdown validator " + name);
                this.warn(e);
            }
        }
    }
};
