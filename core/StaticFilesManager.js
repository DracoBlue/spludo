/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var Buffer = require('buffer').Buffer;

/**
 * @class A manager for static files. It will automatically dispatch the static
 *        files (from the core/plugins' static folders).
 * 
 * @since 0.1
 * @author DracoBlue
 */
StaticFilesManager = function() {
    this.folders = [];
    this.files = {};
};

extend(true, StaticFilesManager.prototype, Logging.prototype);

var child_process = require("child_process");
var fs = require("fs");

StaticFilesManager.prototype.addFolder = function(folder_name) {
    if (this.folders[folder_name]) {
        throw new Error("Folder " + folder_name + " already added!");
    }
    this.folders[folder_name] = true;

    var file_manager = this;

    file_manager.info("StaticFilesManager.addFolder: adding " + folder_name + " as static folder.");
    child_process.exec("cd " + folder_name + " && find -type f", function(err, stdout, stderr) {
        var files = stdout.split("\n");
        var files_length = files.length;
        for ( var f = 0; f < files_length; f++) {
            if (files[f] !== "") {
                var file_name = files[f].substr(2);
                file_manager.info("StaticFilesManager.addFolder: adding " + file_name + " as static file.");
                file_manager.files["static/" + file_name] = folder_name + file_name;
            }
        }
    });
};


StaticFilesManager.prototype.addFile = function(file_name, absolute_path) {
    this.info("StaticFilesManager.addFolder: adding " + file_name + " from " + absolute_path + " as static file.");
    this.files["static/" + file_name] = absolute_path;
};

StaticFilesManager.prototype.removeFile = function(file_name) {
    this.info("removeFile:", file_name);
    delete this.files["static/" + file_name];
};

StaticFilesManager.prototype.getFileAbsolutePath = function(file_name) {
    this.info("getFileAbsolutePath", file_name);
    return this.files[file_name];
};

StaticFilesManager.prototype.canHandleRequest = function(req) {
    var uri = req.url.substr(1);
    return typeof this.files[uri] === "undefined" ? false : true;
};

var file_extension_to_mime_type_map = {
        "html": "text/html",
        "js": "application/x-javascript",
        "css": "text/css",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png"
};

StaticFilesManager.prototype.handleRequest = function(req, res) {
    var uri = req.url.substr(1);
    
    this.info('static: ' + uri);
    var file_extension = /\.([\w]+)$/.exec(uri);

    var mime_type = "application/octet-stream";
    
    if (file_extension) {
        mime_type = file_extension_to_mime_type_map[file_extension[1]] || mime_type;
    }
    
    if (this.files[uri] === "undefined") {
        res.sendHeader(500, {
            "Content-Type": "text/plain"
        });
        res.sendBody("cannot find static file " + uri);
        res.finish();
    }

    var static_file_cache = {};

    fs.readFile(this.files[uri], "binary", function(err, content) {
        if (err) {
            res.sendHeader(404, {
            });
        } else {
            var content_buffer_length = Buffer.byteLength(content, "binary");
            
            res.writeHead(200, {
                "Content-Type": mime_type,
                "Cache-Control": "public, max-age=300",
                "Content-Length": content_buffer_length
            });
            
//            var content_buffer = new Buffer(content_buffer_length);
//            content_buffer.write(content, 'binary', 0);  
//            res.write(content_buffer, "binary");
            
//            var content_length = content.length;
//            
//            var i = 0;
//            
//            while (i<content_length) {
//                res.write(content.substr(i,2048), "binary");
//                i = i + 2048;
//            }
            res.write(content, "binary");
        }
        res.end();
    });
};
