/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class The manager for all registered storages.
 * 
 * @extends Logging
 */
StorageManager = function() {
    this.storages = {};
};

extend(true, StorageManager.prototype, Logging.prototype);

StorageManager.prototype.logging_prefix = 'StorageManager';

StorageManager.prototype.addStorage = function(name, storage) {
    this.trace("addStorage", arguments);
    this.storages[name] = storage;
};

StorageManager.prototype.getStorage = function(name) {
    if (this.storages[name]) {
        return this.storages[name];
    }

    throw new Error("Storage for name " + name + " not found!");
};

StorageManager.prototype.shutdown = function() {
    this.trace("shutdown", arguments);
    var self = this;
    
    return function(cb) {
        var shutdown_chain = [];
        
        for (name in self.storages) {
            /*
             * Check whether this storage has a shutdown method.
             */
            if (typeof self.storages[name].shutdown === "function") {
                (function(current_storage) {
                    shutdown_chain.push(function(chain_cb) {
                        try {
                            current_storage.shutdown()(function() {
                                chain_cb();
                            });
                        } catch (e) {
                            self.warn("Exception when trying to shutdown storage " + name);
                            self.warn(e);
                            chain_cb();
                        }
                    });
                })(self.storages[name]);
            }
        }
        
        if (shutdown_chain.length) {
            group.apply(GLOBAL, shutdown_chain)(function() {
                cb();
            });
        } else {
            cb();
        }
    };
};
