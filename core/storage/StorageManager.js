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
    this.storages_by_name = {};
    this.storages = [];
};

extend(true, StorageManager.prototype, Logging.prototype);

StorageManager.prototype.logging_prefix = 'StorageManager';

StorageManager.prototype.addStorage = function(name, storage) {
    this.trace("addStorage", arguments);
    this.storages_by_name[name] = storage;
    this.storages.push(storage);
};

StorageManager.prototype.getStorage = function(name) {
    if (this.storages_by_name[name]) {
        return this.storages_by_name[name];
    }

    throw new Error("Storage for name " + name + " not found!");
};

StorageManager.prototype.shutdown = function() {
    this.trace("shutdown", arguments);
    var that = this;
    
    return function(cb) {
        var shutdown_chain = [];
        
        that.storages.forEach(function(current_storage) {
            /*
             * Check whether this storage has a shutdown method.
             */
            if (typeof current_storage.shutdown === "function") {
                shutdown_chain.push(function(chain_cb) {
                    try {
                        current_storage.shutdown()(function() {
                            chain_cb();
                        });
                    } catch (e) {
                        that.warn("Exception when trying to shutdown storage " + name);
                        that.warn(e);
                        chain_cb();
                    }
                });
            }
        });
        
        if (shutdown_chain.length) {
            group.apply(GLOBAL, shutdown_chain)(function() {
                cb();
            });
        } else {
            cb();
        }
    };
};
