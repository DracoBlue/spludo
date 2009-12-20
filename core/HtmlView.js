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

HtmlView = function(name, content_file) {
    this.content_file = content_file;
    view_manager.addView(name, this);
};

var html_view_format = {};

HtmlView.prototype = {
    "render": function(params, context) {
        var content = null;
        var posix = require("posix");
        var sys = require("sys");

        var file_name = this.content_file;

        if (typeof html_view_format[file_name] === "undefined") {
            posix.cat(file_name).addCallback(function(file_content) {
                content = file_content;
            }).wait();

            var next_js_tag = content.indexOf("<?javascript");
            var js_tag_length = "<?javascript".length;

            if (next_js_tag === -1) {
                html_view_format[file_name] = function() {
                    return content;
                }
            } else {
                /*
                 * We have <?javascript ... ?> definitions, let's parse them!
                 */
                var content_array = [];
                var current_block_start = 0;
                var end_of_js_tag = 0;

                while (next_js_tag != -1) {
                    content_array.push("content.push("
                            + JSON.stringify(content.substr(current_block_start, next_js_tag)) + ");\n");

                    end_of_js_tag = content.indexOf("?>", next_js_tag);

                    if (end_of_js_tag === -1) {
                        throw new Error("<?javascript tag not finished!");
                    }

                    content_array.push("\n"
                            + content.substr(next_js_tag + js_tag_length, end_of_js_tag - next_js_tag - js_tag_length)
                            + "\n");
                    current_block_start = end_of_js_tag + 2;
                    next_js_tag = content.indexOf("<?javascript", current_block_start);
                }

                if (current_block_start != content.length) {
                    content_array.push("content.push("
                            + JSON.stringify(content.substr(current_block_start, content.length)) + ");\n");
                }

                html_view_format[file_name] = new Function("params", "context", "var content = [];\n "
                        + content_array.join("\n") + " \nreturn content.join(''); ");
            }
        }

        return html_view_format[file_name]();
    }
}
