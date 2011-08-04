/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var vows = require("vows");
var assert = require("assert");

require('./../../core');

var fs = require("fs");

function checkEjsRenderVsExpectedFile(ejs_file_name, expected_file_name) {
    var new_view = new EjsView("plain_html_file", "testdata/" + ejs_file_name);

    var real_contents = fs.readFileSync("testdata/" + expected_file_name);
    return {
        'topic': function() {
            var that = this;
            new_view.render()(function(response) {
                that.callback(null, response);
            });
        },
        'returns valid response': function(res, response) {

            assert.equal(response, real_contents);
        }
    };
}

vows.describe("core.ejs").addBatch({
    
    "PlainHtmlFiles": {

        'topic': function() {
            bootstrap_manager.whenLoaded(this.callback);
        },

        loadingAPlainHtmlFile: checkEjsRenderVsExpectedFile("plain_html_file.ejs", "plain_html_file.ejs"),
        loadingAPlainHtmlFileWithATag: checkEjsRenderVsExpectedFile("plain_html_file_with_beginning_tag.ejs", "plain_html_file_with_beginning_tag.ejs")
    },
    
    'SimpleEjsFiles': {
        
        'topic': function() {
            bootstrap_manager.whenLoaded(this.callback);
        },

        withTwoBlocks: checkEjsRenderVsExpectedFile("ejs_example_with_indention_and_two_blocks.ejs", "ejs_example_with_indention_and_two_blocks.ejs.expected_output.txt"),
        withBlockAtBeginning: checkEjsRenderVsExpectedFile("ejs_example_with_ejs_at_the_beginning.ejs", "ejs_example_with_ejs_at_the_beginning.ejs.expected_output.txt")
    },
    
    'ExpressionEjsFiles': {
        
        'topic': function() {
            bootstrap_manager.whenLoaded(this.callback);
        },

        'ejsFileWithMultipleExpressionBlocks': checkEjsRenderVsExpectedFile("ejs_example_with_expression.ejs", "ejs_example_with_expression.ejs.expected_output.txt"),
        'exceptionWithWrongBlock': function() {
          var new_view = new EjsView("plain_html_file", "testdata/ejs_exception_for_not_closed_expression_tag.ejs");
    
          try {
              new_view.render();
              fail("Should throw an exception!");
          } catch (e) {
              if (e.message.indexOf("tag not finished") === -1) {
                  fail("Should throw something about 'tag not finished', but threw a: " + e.message);
              }
          }
        }
    },
    
    exceptionForSemicolonInExpressionBlock: function() {
        var new_view = new EjsView("plain_html_file", "testdata/ejs_exception_for_semicolon_in_expression_tag.ejs");

        try {
            new_view.render();
            fail("Should throw an exception!");
        } catch (e) {
            if (e.message.indexOf("Syntax Error") === -1) {
                fail("Should throw a Syntax Error, but threw a: " + e.message);
            }
       }
    }
    
}).export(module);

