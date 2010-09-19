/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
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
    
    this.encodeSync = this.options.encodeSync || this.encodeSync;
    this.decodeSync = this.options.decodeSync || this.decodeSync;
    
    data_mapper_manager.addDataMapper(name, this);
};

extend(true, DataMapper.prototype, Options.prototype, Logging.prototype);

DataMapper.prototype.encode = function(parameter, options) {
    throw new Error("Implement encode-method me!");
};

DataMapper.prototype.decode = function(parameter, options) {
    throw new Error("Implement decode-method me!");
};

DataMapper.prototype.encodeSync = function(parameter, options) {
    throw new Error("Implement encodeSync-method me!");
};

DataMapper.prototype.decodeSync = function(parameter, options) {
    throw new Error("Implement decodeSync-method me!");
};
