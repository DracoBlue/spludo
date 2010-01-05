/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class The base for all data_mappers.
 *
 * @extends Options
 * @extends Logging
 *
 * @since 0.1 
 * @author DracoBlue
 */
DataMapper = function(name, options) {
    this.setOptions(options);

    this.encode = this.options.encode || this.encode;
    this.decode = this.options.decode || this.decode;
    
    delete this.options.execute;

    data_mapper_manager.addDataMapper(name, this);
};

process.mixin(true, DataMapper.prototype, Options.prototype, Logging.prototype);

DataMapper.prototype.encode = function(parameter, options) {
    throw new Error("Implement encode-method me!");
};

DataMapper.prototype.decode = function(parameter, options) {
    throw new Error("Implement decode-method me!");
};
