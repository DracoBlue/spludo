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
Validation = function() {
    this.validators = {};

    /** 
     * All values, which are already validated (since last execute-call).
     */
    this.validated_values = {};
};

extend(true, Validation.prototype, Options.prototype, Logging.prototype);

Validation.prototype.execute = function(values) {
    var errors = [];
    var validated_values = {};

    for (key in values) {
        var validators = this.validators[key];
        if (validators) {
            var validators_length = validators.length;
            for (v = 0; v < validators_length; v++) {
                var value_errors = validators[v].instance.execute(values[key], validators[v].options);
                var value_errors_length = value_errors.length;
                
                if (value_errors_length === 0) {
                    validated_values[key] = values[key];
                } else {
                    var value_error_messages = [];
                    
                    for (m = 0; m < value_errors_length; m++) {
                        var validator_message = validators[v].error_messages[value_errors[m]];
                        
                        /*
                         * If we have no validator message, let's try the default.
                         */
                        validator_message = validator_message || validators[v].error_messages[""];
                        
                        if (validator_message) {
                            value_error_messages.push(validator_message);
                        }
                    }

                    errors.push([key, value_errors, value_error_messages]);
                }
            }
        }
        /*
         * If no validator is registered, this parameter won't be pushed to
         * validated_values.
         */
    }

    this.validated_values = validated_values;

    return errors;
};

Validation.prototype.add = function(key, validator_name, options, error_messages) {
    this.validators[key] = this.validators[key] || [];
    this.validators[key].push({
        "instance": validator_manager.getValidator(validator_name),
        "options": options || {},
        "error_messages": error_messages || {}
    });
};

Validation.prototype.getValidatedValues = function() {
    return this.validated_values || {};
};
