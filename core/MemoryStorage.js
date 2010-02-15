/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class The memory storage.
 * 
 * @since 0.1
 * @author DracoBlue
 */
MemoryStorage = function(name, options) {
    this.values = {};

    this.setOptions(options);

    storage_manager.addStorage(name, this);
};

process.mixin(true, MemoryStorage.prototype, Options.prototype, Logging.prototype);

MemoryStorage.prototype.set = function(key, value) {
    this.values[key] = value;
};

MemoryStorage.prototype.get = function(key) {
    return this.values[key];
};

MemoryStorage.prototype.has = function(key) {
    return typeof this.values[key] !== "undefined";
};

MemoryStorage.prototype.remove = function(key) {
    delete this.values[key];
};
