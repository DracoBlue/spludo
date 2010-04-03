/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class A class for a database connection.
 * 
 * @extends Logging
 * 
 * @since 0.1 
 * @author DracoBlue
 */
DatabaseConnection = function(options) {

};

extend(true, DatabaseConnection.prototype, Logging.prototype);

DatabaseConnection.prototype.retrieveById = function(element_type, id) {
    throw new Error('Implement retrieveById method!');
};

DatabaseConnection.prototype.store = function(element) {
    throw new Error('Implement store method!');
};

