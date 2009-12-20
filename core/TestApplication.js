/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class The application, which runs the TestSuites.
 * 
 * @extends BaseApplication
 * 
 * @param {Object} options Options to specify the behaviour
 * @param {String} [options.format=console] The format of the output (can be console or xml).
 * 
 * @since 0.1
 * @author DracoBlue
 */
TestApplication = function(options) {
    this.setOptions(options);

    process.mixin(GLOBAL, require("./../build/testing/qunit"));

    require("./TestSuite");
    require("./TestSuiteManager");

    test_suite_manager = new TestSuiteManager();
};

process.mixin(true, TestApplication.prototype, BaseApplication.prototype);

TestApplication.prototype.run = function() {
    var sys = require("sys");
    var posix = require("posix");

    var application_directory = process.cwd() + "/";
    test_suite_manager.loadTests(application_directory);
    
    var module_names = [];

    try {
        posix.readdir(application_directory + "modules").addCallback(function(contents) {
            module_names = contents;
        }).wait();
    } catch (e) {
        /*
         * We can't read the modules directory, cause there is none :(
         */
    }

    /*
     * For each module, load what needs to be loaded.
     */
    for ( var i = 0; i < module_names.length; i++) {
        var module_name = module_names[i];
        test_suite_manager.loadTests(application_directory + "modules/" + module_name + "/", module_name);
    }
    
    test_suite_manager.execute();
    
    if (this.options.format === "xml") {
        sys.puts(test_suite_manager.getResultAsJunitXml());
    } else {
        sys.puts(test_suite_manager.getResultAsText());
    }
};