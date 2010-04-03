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
 * 
 * @since 0.1
 * @author DracoBlue
 */
StorageManager = function() {
    this.storages = {};
};

extend(true, StorageManager.prototype, Logging.prototype);

StorageManager.prototype.addStorage = function(name, storage) {
    this.info("addStorage: name:" + name);
    this.storages[name] = storage;
};

StorageManager.prototype.getStorage = function(name) {
    if (this.storages[name]) {
        return this.storages[name];
    }

    throw new Error("Storage for name " + name + " not found!");
};

StorageManager.prototype.shutdown = function() {
    for (name in this.storages) {
        /*
         * Check wether this storage has a shutdown method.
         */
        if (typeof this.storages[name].shutdown === "function") {
            try {
                this.storages[name].shutdown();
            } catch (e) {
                this.warn("Exception when trying to shutdown storage " + name);
                this.warn(e);
            }
        }
    }
};
