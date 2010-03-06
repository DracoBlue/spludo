/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var fs = require("fs");

var next_ejs_slot_view_id = 1;

/**
 * @class A EjsView, which reads a template file and executes it. Those template
 *        files may include inline server-side javascript.
 * 
 * @param {String} name
 * @param {String} content_file
 * @param {String} [encoding="utf8"]
 * @since 0.1
 * @author DracoBlue
 */
EjsView = function(name, content_file, encoding) {
    encoding = encoding || "utf8";
    
    var view = this;
    this.content_file = content_file;

    var file_content = "";
    
    try {
        file_content = fs.readFileSync(content_file, encoding);
    } catch (e) {
        throw new Error("Cannot read Ejs-File at " + content_file);
    }
    
    view.content = file_content;
    view_manager.addView(name, view);
};

var ejs_view_format = {};

EjsView.prototype.render = function(params, context, inner) {
    var file_name = this.content_file;
    
    if (typeof ejs_view_format[file_name] === "undefined") {

        var content = this.content;

        var next_js_tag = content.indexOf("<%");
        var js_tag_length = "<%".length;

        if (next_js_tag === -1) {
            ejs_view_format[file_name] = function() {
                return [content, []];
            };
        } else {
            /*
             * We have <% ... %> definitions, let's parse them!
             */
            var body = [];
            var current_block_start = 0;
            var end_of_js_tag = 0;
            var next_js_tag_end = 0;

            body.push("var content = [];");
            body.push("var slots = [];");
            body.push("var slot = function(path, context, inner) {");
            body.push("    var slot_id = next_ejs_slot_view_id++;");
            body.push("    slots.push([slot_id, path, context, inner]);");
            body.push("    return '%%%EJSSLOT%' + slot_id + '%%%';");
            body.push("};");

            while (next_js_tag != -1) {
                next_js_tag_end = next_js_tag + js_tag_length;

                body.push("\ncontent.push(");
                body.push(JSON.stringify(content.substr(current_block_start, next_js_tag - current_block_start)));
                body.push(");\n");

                end_of_js_tag = content.indexOf("%>", next_js_tag);

                if (end_of_js_tag === -1) {
                    throw new Error("<% tag not finished!");
                }

                body.push("\n");

                if (content.charAt(next_js_tag_end) === '=') {
                    /*
                     * Ok, this is a special one! We have <%=EXPR%>
                     */
                    body.push("\ncontent.push(");
                    body.push(content.substr(next_js_tag_end + 1, end_of_js_tag - next_js_tag_end - 1));
                    body.push(");\n");
                } else {
                    body.push(content.substr(next_js_tag_end, end_of_js_tag - next_js_tag_end));
                }

                body.push("\n");

                current_block_start = end_of_js_tag + 2;
                next_js_tag = content.indexOf("<%", current_block_start);
            }

            if (current_block_start != content.length) {
                body.push("content.push(");
                body.push(JSON.stringify(content.substr(current_block_start, content.length)));
                body.push(");\n");
            }

            body.push("return [content.join(''), slots];");

            try {
                ejs_view_format[file_name] = new Function("params", "context", "inner", "next_ejs_slot_view_id", body.join("\n"));
            } catch (e) {
                throw new Error("Syntax Error in .ejs-File: " + e.message, file_name, 0);
            }
        }
    }

    return function(cb) {
        var ejs_view_response = ejs_view_format[file_name](params, context, inner, next_ejs_slot_view_id);

        var response = ejs_view_response[0];
        var slots = ejs_view_response[1];
        
        if (slots.length > 0) {
            next_ejs_slot_view_id += slots.length;
            
            var chain_elements = [];
            slots.forEach(function(element) {
                chain_elements.push(function (chain_cb) {
                    var slot_id = element[0];
                    BaseApplication.executePath(element[1], element[2], element[3])(function(slot_response) {
                        response = response.replace("%%%EJSSLOT%" + slot_id + "%%%", slot_response);
                        chain_cb();
                    });
                });
            });
            chain_elements.push(function () {
                cb(response);
            });
            
            chain.apply(this, chain_elements);
        } else {
            cb(response);
        }
    };
};
