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
 */
ServerApplication = function(options) {
    this.setOptions(options);

    if (typeof this.options.port === "undefined") {
        this.options.port = config.getPathValue(["server", "port"], 8000);
    }
    
    if (typeof this.options.server_name === "undefined") {
        this.options.server_name = config.getPathValue(["server", "name"], 'Spludo ' + config.get('core').version + ', node.JS ' + process.version);
    }
    
    /**
     * The Http-Server listening for new connections.
     * 
     * @private
     */
    this.server = null;
};

extend(true, ServerApplication.prototype, BaseApplication.prototype);

ServerApplication.prototype.logging_prefix = 'ServerApplication';

var http = require("http");
var sys = require("sys");
var multipart = require("./lib/multipart");
var url = require("url");
var querystring = require("querystring");

/**
 * Runs the application.
 */
ServerApplication.prototype.run = function() {
    var that = this;
    
    var finishRequest = function(req, res, body, params) {
        var context = {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Server': that.options.server_name
            }
        };
        
        context.params = params || {};

        var execution_path = null;
        
        var request_url = url.parse(req.url, true);
        extend(true, context.params, request_url.query);

        execution_path = request_url.pathname.substr(1);
        
        if (body !== null) {
            /*
			 * Ok, we need to parse that!
			 */
            extend(true, context.params, querystring.parse(body));
        }
        
        ContextToolkit.applyRequestHeaders(context, req.headers);

        var response = null;
        
        var session_id = null;

        var responseHandler = function(response) {
            session_manager.finishWebContextSession(session_id, context, req.headers)(function() {
                ContextToolkit.applyCookiesToHeaders(context);

                res.writeHead(context.status, context.headers);
                
                if (req.method !== "HEAD") {
                    if(response || false) res.write(response, context.encoding || "utf8");
                }
                res.end();
            });
        };

        session_manager.initializeWebContextSession(context, req)(function(real_session_id) {
            session_id = real_session_id;
            context.session_id = session_id;
            try {
                BaseApplication.executePath(execution_path, context)(responseHandler);
            } catch (e) {
                context.status = 404;
                response = "Page not found!\n\n" + (e.stack || e.message) + "\n\n";
                response = response + "Arguments: " + sys.inspect(e['arguments']);
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

        req.setEncoding("binary");
        
        var stream = multipart.parse(req);
        
        if (stream.isMultiPart) {
            
            var parts_base_name_last_index = {};
            
            var parts = {};
            var current_part_name = null;
            
            stream.addListener("partBegin", function (part) {
                current_part_name = part.name;
                if (current_part_name.substr(-2) === '[]') {
                    var current_part_base_name = current_part_name.substr(0, current_part_name.length - 2);
                    if (typeof parts_base_name_last_index[current_part_base_name] === "undefined") {
                        parts_base_name_last_index[current_part_base_name] = 0;
                    } else {
                        parts_base_name_last_index[current_part_base_name]++;
                    }
                    
                    current_part_name = current_part_base_name + '[' + parts_base_name_last_index[current_part_base_name] + ']';
                }
                
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
    
    this.info("Listening on port " + this.options["port"]);

    this.server.listen(this.options["port"]);
};
