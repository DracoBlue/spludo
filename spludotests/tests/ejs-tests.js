new TestSuite("PlainHtmlFiles", {
    loadingAPlainHtmlFile: function() {
        var new_view = new EjsView(
            "plain_html_file",
            "testdata/plain_html_file.ejs"
        );

        var posix = require("posix");

        var real_contents = "";
        posix.cat("testdata/plain_html_file.ejs").addCallback(function(contents) {
            real_contents = contents;        
        });

        equal(new_view.render(), real_contents);
    },
    
    loadingAPlainHtmlFileWithATag: function() {
        var new_view = new EjsView(
            "plain_html_file",
            "testdata/plain_html_file_with_beginning_tag.ejs"
        );

        var posix = require("posix");

        var real_contents = "";
        posix.cat("testdata/plain_html_file_with_beginning_tag.ejs").addCallback(function(contents) {
            real_contents = contents;        
        });

        equal(new_view.render(), real_contents);
    }    
});

new TestSuite("SimpleEjsFiles", {
    simpleEjsFileWithTwoBlocks: function() {
        var new_view = new EjsView(
            "plain_html_file",
            "testdata/ejs_example_with_indention_and_two_blocks.ejs"
        );

        var posix = require("posix");

        var real_contents = "";
        posix.cat("testdata/ejs_example_with_indention_and_two_blocks.ejs.expected_output.txt").addCallback(function(contents) {
            real_contents = contents;        
        });
        
        equal(new_view.render(), real_contents);
    },
    simpleEjsFileWithBlockAtBeginning: function() {
        var new_view = new EjsView(
            "plain_html_file",
            "testdata/ejs_example_with_ejs_at_the_beginning.ejs"
        );

        var posix = require("posix");

        var real_contents = "";
        posix.cat("testdata/ejs_example_with_ejs_at_the_beginning.ejs.expected_output.txt").addCallback(function(contents) {
            real_contents = contents;        
        });
        
        equal(new_view.render(), real_contents);
    }
});
