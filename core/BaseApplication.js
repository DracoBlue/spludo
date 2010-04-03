/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class Is a base application (should be extended).
 * 
 * @extends Options
 * @extends Logging
 * 
 * @since 0.1
 * @author DracoBlue
 */
BaseApplication = function(options) {
    this.setOptions(options);
    if (typeof this.run !== "function") {
        throw new Error("Implement the .run method!");
    }
};

extend(true, BaseApplication.prototype, Options.prototype, Logging.prototype);

/**
 * Runs the application.
 */
BaseApplication.prototype.run = function() {
    throw new Error("run method not implemented!");
};

/**
 * Runs a specific path
 */
BaseApplication.executePath = function(path, context, inner) {
    context = context || {};
    inner = inner || null;

    var controller = controller_manager.getController(path);
    
    return function(cb) {
        var response = "";
        
        chain(function(chain_cb) {
            controller[0].execute(controller[1], context)(function(chain_response) {
                response = chain_response;
                chain_cb();
            });
        }, function(chain_cb) {
            if (typeof context.view_name !== "undefined") {
                /*
                 * We need the view manager, since the view-name is set!
                 */
                var view = view_manager.getView(context.view_name);
                view.render(controller[1], context, inner)(function(chain_response) {
                    response = chain_response;
                    chain_cb();
                });
            } else {
                chain_cb();
            }
        }, function(chain_cb) {
            if (typeof context.layout_name !== "undefined") {
                /*
                 * We need the view manager, since the view-name is set!
                 */
                var layout_view = view_manager.getView(context.layout_name);
                layout_view.render(controller[1], context, response)(function(chain_response) {
                    response = chain_response;
                    chain_cb();
                });
            } else {
                chain_cb();
            }
        }, function() {
            cb(response);
        });
    };
};
