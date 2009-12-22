/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

new TestSuite("PlainHtmlFiles", {
    loadingAPlainHtmlFile: function() {
        var new_view = new EjsView("plain_html_file", "testdata/plain_html_file.ejs");

        var posix = require("posix");

        var real_contents = "";
        posix.cat("testdata/plain_html_file.ejs").addCallback(function(contents) {
            real_contents = contents;
        }).wait();

        equal(new_view.render(), real_contents);
    },

    loadingAPlainHtmlFileWithATag: function() {
        var new_view = new EjsView("plain_html_file", "testdata/plain_html_file_with_beginning_tag.ejs");

        var posix = require("posix");

        var real_contents = "";
        posix.cat("testdata/plain_html_file_with_beginning_tag.ejs").addCallback(function(contents) {
            real_contents = contents;
        }).wait();

        equal(new_view.render(), real_contents);
    }
});

new TestSuite("SimpleEjsFiles", {
    simpleEjsFileWithTwoBlocks: function() {
        var new_view = new EjsView("plain_html_file", "testdata/ejs_example_with_indention_and_two_blocks.ejs");

        var posix = require("posix");

        var real_contents = "";
        posix.cat("testdata/ejs_example_with_indention_and_two_blocks.ejs.expected_output.txt").addCallback(
                function(contents) {
                    real_contents = contents;
                }).wait();

        equal(new_view.render(), real_contents);
    },
    simpleEjsFileWithBlockAtBeginning: function() {
        var new_view = new EjsView("plain_html_file", "testdata/ejs_example_with_ejs_at_the_beginning.ejs");

        var posix = require("posix");

        var real_contents = "";
        posix.cat("testdata/ejs_example_with_ejs_at_the_beginning.ejs.expected_output.txt").addCallback(
                function(contents) {
                    real_contents = contents;
                }).wait();

        equal(new_view.render(), real_contents);
    }
});

new TestSuite("ExpressionEjsFiles", {
    ejsFileWithMultipleExpressionBlocks: function() {
        var new_view = new EjsView("plain_html_file", "testdata/ejs_example_with_expression.ejs");

        var posix = require("posix");

        var real_contents = "";
        posix.cat("testdata/ejs_example_with_expression.ejs.expected_output.txt").addCallback(function(contents) {
            real_contents = contents;
        }).wait();

        equal(new_view.render(), real_contents);
    },

    exceptionWithWrongBlock: function() {
        var new_view = new EjsView("plain_html_file", "testdata/ejs_exception_for_not_closed_expression_tag.ejs");

        try {
            new_view.render()
            fail("Should throw an exception!");
        } catch (e) {
            if (e.message.indexOf("tag not finished") === -1) {
                fail("Should throw something about 'tag not finished', but threw a: " + e.message);
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

});
