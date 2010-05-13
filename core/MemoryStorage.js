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

extend(true, MemoryStorage.prototype, Options.prototype, Logging.prototype);

MemoryStorage.prototype.set = function(key, value) {
    var self = this;
    return function(cb) {
        self.values[key] = value;
        cb(true);
    };
};

MemoryStorage.prototype.get = function(key) {
    var self = this;
    return function(cb) {
        if (typeof self.values[key] === 'undefined') {
            cb();
        } else {
            cb(self.values[key]);
        }
    };
};

MemoryStorage.prototype.has = function(key) {
    var self = this;
    return function(cb) {
        if (typeof self.values[key] === 'undefined') {
            cb(false);
        } else {
            cb(true);
        }
    };
};

MemoryStorage.prototype.remove = function(key) {
    var self = this;
    return function(cb) {
        if (typeof self.values[key] === 'undefined') {
            cb(false);
        } else {
            delete self.values[key];
            cb(true);
        }
    };
};
