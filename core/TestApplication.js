/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
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

    extend(GLOBAL, require("./../build/testing/qunit"));

    require("./TestSuite");
    require("./TestSuiteManager");

    test_suite_manager = new TestSuiteManager();
};

extend(true, TestApplication.prototype, BaseApplication.prototype);

var sys = require("sys");
var fs = require("fs");

TestApplication.prototype.run = function() {
    var self = this;
    bootstrap_manager.event_emitter.addListener('end', function() {
        var application_directory = process.cwd() + "/";

        var load_tests_chain = [];
        
        load_tests_chain.push(function(chain_cb) {
            test_suite_manager.loadTests(application_directory)(function(){
                chain_cb();
            });
        });
        
        var module_names = [];

        try {
            module_names = fs.readdirSync(application_directory + "modules");
        } catch (e) {
            /*
             * We can't read the modules directory, cause there is none :(
             */
        }
        
        /*
         * For each module, load what needs to be loaded.
         */
        for ( var i = 0; i < module_names.length; i++) {
            (function(i) {
                var module_name = module_names[i];
                load_tests_chain.push(function(chain_cb) {
                    test_suite_manager.loadTests(application_directory + "modules/" + module_name + "/", module_name)(function(){
                        chain_cb();
                    });
                });
            })(i);
        }
        
        load_tests_chain.push(function() {
            test_suite_manager.execute();
            
            if (self.options.format === "xml") {
                sys.puts(test_suite_manager.getResultAsJunitXml());
            } else {
                sys.puts(test_suite_manager.getResultAsText());
            }
            
            storage_manager.shutdown();
        });
        
        chain.apply(GLOBAL, load_tests_chain);
        
    });
};
