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

    this.options.session_key = this.options.session_key || "s";

    /**
     * The Http-Server listening for new connections.
     * 
     * @private
     */
    this.server = null;
};

process.mixin(true, ServerApplication.prototype, BaseApplication.prototype);

var http = require("http");
var sys = require("sys");

/**
 * Runs the application.
 */
ServerApplication.prototype.run = function() {
    
    var session_key = this.options.session_key;

    var finishRequest = function(req, res, body) {
        var context = {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Server': 'Spludo 0.1'
            }
        };
        
        context.params = {};

        if (body !== null) {
            /*
             * Ok, we need to parse that!
             */
             var body_entries = body.split("&");
             var body_entries_length = body_entries.length;
             var i = 0;

             for (i=0; i<body_entries_length; i++) {
                var row = body_entries[i].split("=");
                var key = decodeURIComponent(row[0]);
                var value = decodeURIComponent(row[1] || "");
                context.params[key] = value;
             }
        }

        ContextToolkit.applyRequestHeaders(context, req.headers);

        var session_id = (context.cookies && context.cookies[session_key]) || null;
        
        if (session_id) {
            try {
                context.session = session_manager.getSession(session_id);
            } catch (e) {
                /*
                 * Seems like that cookie is invalid by now. Let's remove the cookie.
                 */
                ContextToolkit.removeCookie(context, session_key);
                session_id = null;
            }
        }
        
        context.session_id = session_id;

        var response = null;
        
        try {
            response = BaseApplication.executePath(req.url.substr(1), context);
        } catch (e) {
            context.status = 404;
            response = "Page not found!" + sys.inspect(e);
        }

        if (session_id !== context.session_id) {
            session_id = context.session_id;

            if (session_id === null) {
                ContextToolkit.removeCookie(context, session_key);
            } else {
                ContextToolkit.setCookie(context, session_key, session_id);
            }
        }

        ContextToolkit.applyCookiesToHeaders(context);

        res.sendHeader(context.status, context.headers);
        res.sendBody(response, "binary");

        res.finish();
    };
    
    this.server = http.createServer(function(req, res) {
        if (static_files_manager.canHandleRequest(req)) {
            static_files_manager.handleRequest(req, res);
            return ;
        }
        
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
