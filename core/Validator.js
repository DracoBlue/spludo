/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class The base for all validators.
 * 
 * @since 0.1 
 * @author DracoBlue
 */
Validator = function(name, options) {
    this.setOptions(options);

    this.execute = this.options.execute || this.execute;
    
    delete this.options.execute;

    validator_manager.addValidator(name, this);
};

extend(true, Validator.prototype, Options.prototype, Logging.prototype);

Validator.prototype.execute = function(parameter, options) {
    throw new Error("Implement execute-method me!");
};
