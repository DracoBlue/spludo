/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class The application running and listening on a specific port.
 * 
 * @extends BaseApplication
 * 
 * @param {Object}
 *            options Options to specify the behaviour
 * @param {Number}
 *            options.port The port, which should be used when launching the
 *            application server.
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

extend(true, ServerApplication.prototype, BaseApplication.prototype);

var http = require("http");
var sys = require("sys");
var multipart = require("./libs/multipart");

/**
 * Runs the application.
 */
ServerApplication.prototype.run = function() {
    var finishRequest = function(req, res, body, params) {
        var context = {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Server': 'Spludo 0.1'
            }
        };
        
        context.params = params || {};
        
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

        var response = null;
        
        var session_id = null;

        var responseHandler = function(response) {
            session_manager.finishWebContextSession(session_id, context, req.headers)(function() {
                ContextToolkit.applyCookiesToHeaders(context);

                res.sendHeader(context.status, context.headers);
                
                if(response || false) res.write(response, context.encoding || "utf8");

                res.end();
            });
        };

        session_manager.initializeWebContextSession(context, req)(function(real_session_id) {
            session_id = real_session_id;
            context.session_id = session_id;
            try {
                BaseApplication.executePath(req.url.substr(1), context)(responseHandler);
            } catch (e) {
                context.status = 404;
                response = "Page not found!\n\n" + (e.stack || e.message) + "\n\n";
                response = response + "Arguments: " + sys.inspect(e.arguments);
                responseHandler(response);
            }
        });
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

        req.setBodyEncoding("binary");
        
        var stream = multipart.parse(req);
        
        if (stream.isMultiPart) {
            
            var parts = {};
            var current_part_name = null;
            
            stream.addListener("partBegin", function (part) {
                current_part_name = part.name;
                parts[current_part_name] = {
                    "name": current_part_name,
                    "filename": part.filename,
                    "body": []
                };
            });
            
            stream.addListener("body", function(chunk) {
                parts[current_part_name].body.push(chunk);
            });
            
            stream.addListener("partEnd", function () {
                if (current_part_name !== null) {
                    parts[current_part_name].body = parts[current_part_name].body.join("");
                }
                current_part_name = null;
            });
            
            stream.addListener('complete', function(content) {
                finishRequest(req, res, null, parts);
            });
        } else {
            var body = [];
            
            stream.addListener("body", function(chunk) {
                if (chunk === null) {
                    return ;
                }
                body.push(chunk);
            });
            
            stream.addListener('complete', function(content) {
                finishRequest(req, res, body.join(""));
            });
        }
        
    });

    this.server.listen(this.options["port"]);
};
