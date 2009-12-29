/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class A manager for static files. It will automatically dispatch the static
 *        files (from the core/modules' static folders).
 * 
 * @since 0.1
 * @author DracoBlue
 */
StaticFilesManager = function() {
    this.folders = [];
    this.files = {};
};

process.mixin(true, StaticFilesManager.prototype, Logging.prototype);

StaticFilesManager.prototype.addFolder = function(folder_name) {
    if (this.folders[folder_name]) {
        throw new Error("Folder " + folder_name + " already added!");
    }
    this.folders[folder_name] = true;

    var sys = require("sys");

    var file_manager = this;

    file_manager.info("StaticFilesManager.addFolder: adding " + folder_name + " as static folder.");
    sys.exec("cd " + folder_name + " && find -type f").addCallback(function(stdout, stderr) {
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

StaticFilesManager.prototype.canHandleRequest = function(req) {
    var uri = req.uri.full.substr(1);
    return typeof this.files[uri] === "undefined" ? false : true;
};

var file_extension_to_mime_type_map = {
        "js": "application/x-javascript",
        "css": "text/css",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png"
};

StaticFilesManager.prototype.handleRequest = function(req, res) {
    var uri = req.uri.full.substr(1);
    
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

    var posix = require("posix");

    var p = posix.cat(this.files[uri], "binary");

    p.addCallback(function(content) {
        res.sendHeader(200, {
            "Content-Type": mime_type,
            "Cache-Control": "public, max-age=300"
        });
        res.sendBody(content, "binary");
        res.finish();
    });

    p.addErrback(function() {
        res.sendHeader(404, {
        });
        res.sendBody("");
        res.finish();
    });

    p.addCancelback(function() {
        res.sendHeader(404, {
        });
        res.sendBody("");
        res.finish();
    });

};