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
 */
TestApplication = function(options) {
    this.setOptions(options);

    extend(GLOBAL, require("./../../build/testing/qunit"));

    require("./TestSuite");
    require("./TestSuiteManager");

    test_suite_manager = new TestSuiteManager();
};

extend(true, TestApplication.prototype, BaseApplication.prototype);

TestApplication.prototype.logging_prefix = 'TestApplication';

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
        
        var plugin_names = [];

        try {
            plugin_names = fs.readdirSync(application_directory + "plugins");
        } catch (e) {
            /*
             * We can't read the plugins directory, cause there is none :(
             */
        }
        
        /*
         * For each plugin, load what needs to be loaded.
         */
        for ( var i = 0; i < plugin_names.length; i++) {
            (function(i) {
                var plugin_name = plugin_names[i];
                load_tests_chain.push(function(chain_cb) {
                    test_suite_manager.loadTests(application_directory + "plugins/" + plugin_name + "/", plugin_name)(function(){
                        chain_cb();
                    });
                });
            })(i);
        }
        
        load_tests_chain.push(function(chain_cb) {
            self.log('Running all suites');
            test_suite_manager.execute()(function() {
                if (self.options.format === "xml") {
                    sys.puts(test_suite_manager.getResultAsJunitXml());
                } else {
                    sys.puts(test_suite_manager.getResultAsText());
                }
                chain_cb();
            });
        });

        load_tests_chain.push(function() {
            self.log('Shutting down the storage manager');
            storage_manager.shutdown()(function() {
                /*
                 * We need to call this, because for instance watchFile does not
                 * allows the process to exit.
                 * @see https://github.com/DracoBlue/spludo/issues/issue/1
                 */
                process.exit(0);
            });
        });
        
        chain.apply(GLOBAL, load_tests_chain);
        
    });
};
