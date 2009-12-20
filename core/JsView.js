/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

process.isFunction = function(object) {
    return (typeof object == "function") ? true : false;
}

JsView = function(name, render_function) {
    if (process.isFunction(render_function)) {
        this.render = render_function;
    }
    view_manager.addView(name, this);
};

JsView.prototype = {
    "render": function(params, context) {
        throw new Error("Implement the .render method!");
    }
}
