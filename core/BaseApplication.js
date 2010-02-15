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

process.mixin(true, BaseApplication.prototype, Options.prototype);

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
    
    var response = controller[0].execute(controller[1], context);
    
    if (typeof context.view_name !== "undefined") {
        /*
         * We need the view manager, since the view-name is set!
         */
        var view = view_manager.getView(context.view_name);
        response = view.render(controller[1], context, inner);
    }
    
    if (typeof context.layout_name !== "undefined") {
        /*
         * We need the view manager, since the view-name is set!
         */
        var layout_view = view_manager.getView(context.layout_name);
        response = layout_view.render(controller[1], context, response);
    }
    
    return response;
};