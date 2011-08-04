/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class The service manager.
 * 
 * @extends Logging
 */
ServiceManager = function() {
    var that = this;
    this.instances = {};
};

extend(true, ServiceManager.prototype, Logging.prototype);

ServiceManager.prototype.logging_prefix = 'ServiceManager';

ServiceManager.prototype.get = function(key) {
   if (!this.instances[key]) {
       var path = config.get('services', {})[key];
       if (typeof path === 'undefined') {
           this.instances[key] = require('services/' + key + 'Service');
       } else {
           this.instances[key] = require(path);
       }
   }
   return this.instances[key];
};
