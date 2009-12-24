/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class The application running and listening on a specific port.
 * 
 * @extends BaseApplication
 * 
 * @param {Object} options Options to specify the behaviour
 * @param {Number} options.port The port, which should be used when launching the application server.
 * 
 * @since 0.1
 * @author DracoBlue
 */
ServerApplication = function(options) {
    this.setOptions(options);

    /**
     * The Http-Server listening for new connections.
     * 
     * @private
     */
    this.server = null;
};

process.mixin(true, ServerApplication.prototype, BaseApplication.prototype);

/**
 * Runs the application.
 */
ServerApplication.prototype.run = function() {
    var http = require("http");

    var finishRequest = function(req, res, body) {
        var context = {
            status: 200,
            headers: {
                'Content-Type': 'text/plain'
            }
        };
        var sys = require("sys");

        if (body !== null) {
            /*
             * Ok, we need to parse that!
             */
             context.params = {};
             var body_entries = body.split("&");
             var body_entries_length = body_entries.length
             var i = 0;

             for (i=0; i<body_entries_length; i++) {
                var row = body_entries[i].split("=");
                var key = decodeURIComponent(row[0]);
                var value = decodeURIComponent(row[1] || "");
                context.params[key] = value;
             }
        }
        
        ContextToolkit.applyRequestHeaders(context, req.headers);

        var response = null;

        try {
            response = BaseApplication.executePath(req.uri.full.substr(1), context);
        } catch (e) {
            context.status = 404;
            var sys = require("sys");
            response = "Page not found!" + sys.inspect(e);
        }

        res.sendHeader(context.status, context.headers);
        res.sendBody(response);

        res.finish();
    };
    
    this.server = http.createServer(function(req, res) {
        if (req.method === "GET") {
            finishRequest(req, res, null);
            return ;
        }
        
        var body = [];
        
        req.addListener('body', function(content) {
            if (content === null) {
                return ;
            }
            body.push(content);
        });

        req.addListener('complete', function(content) {
            finishRequest(req, res, body.join(""));
        });

    });

    this.server.listen(this.options["port"]);
};
