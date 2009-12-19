/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

BaseApplication = function(options) {
    this.setOptions(options);
    if (typeof this.run !== "function") {
        throw new Error("Implement the .run method!");
    }
};

BaseApplication.prototype = {
/*
 * Each extension should at least implement the run method!
 */
};

process.mixin(true, BaseApplication.prototype, Options.prototype);

ServerApplication = function(options) {
    this.setOptions(options);
    this.server = null;
};

ServerApplication.prototype = {
    "run" : function() {
        var http = require("http");
        this.server = http.createServer(function(req, res) {
            var context = {
                status : 200,
                headers: {
                    'Content-Type' : 'text/plain'
                }
            };

            var response = "Seite nicht gefunden!";

            try {
                var controller = controller_manager.getController(req.uri.full.substr(1));
                response = controller[0].execute(controller[1], context);
                if (typeof context.view_name === "undefined") {
                    /*
                     * That's it! We don't need those views ... :(
                     */
                } else {
                    var view = view_manager.getView(context.view_name);
                    response = view.render(controller[1], context);
                }
            } catch (e) {
                context.status = 404;
                response = "Seite nicht gefunden!" + sys.inspect(e);
            }

            res.sendHeader(context.status, context.headers);
            res.sendBody(response);

            res.finish();
        });
        
        this.server.listen(this.options["port"]);
    }
}

process.mixin(true, ServerApplication.prototype, BaseApplication.prototype);



ConsoleApplication = function(options) {
    this.setOptions(options);
};

ConsoleApplication.prototype = {
    "run" : function() {
        var sys = require("sys");
        var response = null;

        try {
            var context = {}
            var controller = controller_manager.getController(this.options["path"]);
            response = controller[0].execute(controller[1], context);
            if (typeof context.view_name === "undefined") {
                /*
                 * That's it! We don't need those views ... :(
                 */
            } else {
                var view = view_manager.getView(context.view_name);
                response = view.render(controller[1], context);
            }
        } catch (e) {
            response = "Seite nicht gefunden!" + sys.inspect(e);
        }
        
        sys.puts(response);
    }
}

process.mixin(true, ConsoleApplication.prototype, BaseApplication.prototype);
