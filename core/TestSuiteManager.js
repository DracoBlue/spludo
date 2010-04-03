/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class The TestSuite Manager.
 * 
 * @extends Logging
 * @since 0.1
 * @author DracoBlue
 */
TestSuiteManager = function() {
    this.suites = [];
};

extend(true, TestSuiteManager.prototype, Logging.prototype);

var sys = require('sys');

/**
 * Add a suite to the suite manager.
 */
TestSuiteManager.prototype.addTestSuite = function(name, suite, module_name, file_name) {
    module_name = this.current_module_name || file_name;
    file_name = this.current_test_file || file_name;
    
    this.info("addTestSuite: module:" + module_name + ", name:" + name);
    this.suites.push( {
        name: name,
        suite: suite,
        file_name: file_name,
        module_name: module_name
    });
};

/**
 * Execute all registered suites.
 */
TestSuiteManager.prototype.execute = function() {
    var suites_count = this.suites.length;
    var current_suite = null;

    for ( var i = 0; i < suites_count; i++) {
        current_suite = this.suites[i];
        current_suite.suite.execute();
    }
};

/**
 * This function collections all information gained while executing the test
 * suites and returns them as JunitXml-String
 * 
 * return {String}
 */
TestSuiteManager.prototype.getResultAsJunitXml = function() {
    var suite_result = [];
    suite_result.push("<testsuites>");

    var suites_count = this.suites.length;
    for ( var i = 0; i < suites_count; i++) {
        var current_suite = this.suites[i];
        suite_result.push("<testsuite name=\"" + current_suite.name + "\"");
        suite_result.push(" tests=\"" + current_suite.suite.stats.tests + "\"");
        suite_result.push(" assertions=\"" + current_suite.suite.stats.assertions + "\"");
        suite_result.push(" failures=\"" + current_suite.suite.stats.failures + "\"");
        suite_result.push(" errors=\"" + current_suite.suite.stats.errors + "\"");
        suite_result.push(" file=\"" + current_suite.file_name + "\"");
        suite_result.push(">");
        var tests = current_suite.suite.tests;
        var tests_count = tests.length;
        for ( var t = 0; t < tests_count; t++) {
            var current_test = tests[t];

            suite_result.push("<testcase name=\"" + current_test.name + "\"");
            suite_result.push(" assertions=\"" + current_test.stats.assertions + "\"");
            suite_result.push(" failures=\"" + current_test.stats.failures + "\"");
            suite_result.push(" time=\"" + current_test.stats.time + "\"");
            if (current_suite.module_name) {
                suite_result.push(" class=\"" + current_suite.module_name + "\"");
            }
            suite_result.push(" />");
        }
        suite_result.push("</testsuite>");
    }

    suite_result.push("</testsuites>");

    return suite_result.join("");
};

/**
 * This is a pretty big renderer function for the test results.
 * 
 * @TODO Maybe split that into multiple functions!?
 */
TestSuiteManager.prototype.getResultAsText = function() {
    var suite_result = [];
    
    var i = 0;

    /*
     * We'll collect everything we know about every executed suite:
     */
    var overall_stats = {
        failures: 0,
        assertions: 0,
        assertions_success: 0,
        errors: 0,
        tests: 0,
        tests_success: 0
    };

    var suites_count = this.suites.length;
    for ( i = 0; i < suites_count; i++) {
        /*
         * Once we are at one suite, we'll make those two helpers for easier and
         * faster access to the selected suite and its stats
         */
        var current_suite = this.suites[i];
        var current_stats = current_suite.suite.stats;

        /*
         * Let's calculate the overall stats by adding the stats of the current
         * suite
         */
        overall_stats.tests = overall_stats.tests + current_stats.tests;
        overall_stats.tests_success = overall_stats.tests_success + current_stats.tests_success;
        overall_stats.failures = overall_stats.failures + current_stats.failures;
        overall_stats.assertions = overall_stats.assertions + current_stats.assertions;
        overall_stats.assertions_success = overall_stats.assertions_success + current_stats.assertions_success;
        overall_stats.errors = overall_stats.errors + current_stats.errors;

        /*
         * We have a module name? Great! Let's put it as [modulename] in front
         * of the suite name!
         */
        if (current_suite.module_name) {
            suite_result.push("[" + current_suite.module_name + "] ");
        }
        /*
         * Now let's push the suite name
         */
        suite_result.push(current_suite.name + "\n");

        /*
         * Now it's time for some statistics about the current suite. We'll
         * print how many tests worked and how many of the assertions worked.
         */
        suite_result.push("   > Tests: " + (current_stats.tests_success));
        suite_result.push("/" + current_stats.tests + ",");
        suite_result.push(" Assertions: " + current_stats.assertions_success);
        suite_result.push("/" + current_stats.assertions + "");
        suite_result.push(" in " + current_suite.file_name + "\n");

        /*
         * Now it's time for the tests.
         * 
         * Again we use a local variable to have easier access to the tests
         * attribute of the current suite.
         */
        var tests = current_suite.suite.tests;
        var tests_count = tests.length;
        for ( var t = 0; t < tests_count; t++) {
            var current_test = tests[t];

            if (current_test.stats.failures === 0) {
                /*
                 * If the test worked, just push a OK with the time.
                 */
                suite_result.push(" [OK] " + current_test.name + " (" + current_test.stats.time * 1000 + "ms)");
            } else {
                /*
                 * If it didn't work -> let's do some extra explanations.
                 */
                suite_result.push(" [  ] " + current_test.name + " (" + current_test.stats.time * 1000 + "ms)\n");
                suite_result.push("      Assertions: ");
                suite_result.push((current_test.stats.assertions_success) + "/");
                suite_result.push(current_test.stats.assertions);
            }
            suite_result.push("\n");
        }
        
        var failures = current_suite.suite.failures;
        var failures_length = failures.length;
        if (failures_length !== 0) {
            suite_result.push("  > Failures: \n");
            for (var f = 0; f < failures_length; f++) {
                suite_result.push(" [  ] " + failures[f].name);
                suite_result.push(": " + failures[f].message + "\n");
            }
        }
    }

    /*
     * Calculate how many of the assertions and tests worked.
     */
    var promile_test_worked = Math.floor(10000 * (overall_stats.tests_success / overall_stats.tests));
    var promile_assert_worked = Math.floor(10000 * (overall_stats.assertions_success / overall_stats.assertions));

    /*
     * Finally push the result!
     */
    suite_result.push("\n");
    suite_result.push("Results:\n");
    suite_result.push(" Assertions: " + overall_stats.assertions_success + " / ");
    suite_result.push(overall_stats.assertions + " (" + (promile_assert_worked / 100) + "%)\n");
    suite_result.push(" Tests     : " + overall_stats.tests_success + " /" + overall_stats.tests);
    suite_result.push(" (" + (promile_test_worked / 100) + "%)\n");
    suite_result.push("\n");

    /*
     * And for the ascii art, push also a progress bar
     */
    var paint_good_items_count = Math.floor(promile_assert_worked / 100);
    var paint_bad_items_count = 100 - paint_good_items_count;
    suite_result.push(" Progress (" + paint_good_items_count + "%): \n  ");
    for ( i = 0; i < paint_good_items_count; i++) {
        suite_result.push("#");
    }
    for ( i = 0; i < paint_bad_items_count; i++) {
        suite_result.push("_");
    }

    return suite_result.join("");
};

/**
 * Get all available views and load them ... .
 */
TestSuiteManager.prototype.loadTests = function(path, module_name) {
    var self = this;
    
    return function(cb) {
    
        self.info("loadTests: module:" + module_name + ", path:" + path);
        
        try {
            sys.exec("ls " + path + "tests/*.js", function(err, stdout, stderr) {
                var files_in_folder = stdout.split("\n");
    
                var test_files = [];
                
                for (i in files_in_folder) {
                    if (files_in_folder[i] !== "") {
                        test_files.push(files_in_folder[i]);
                    }
                }
                
                for (i in test_files) {
                    self.current_test_file = test_files[i];
                    self.current_module_name = module_name;
                    
                    require(test_files[i].substr(0, test_files[i].length - 3));
                    
                    delete self.current_module_name;
                }
                
                delete self.current_test_file;
                
                cb();
            });
        } catch (e) {
            /*
             * views folder does not exist!
             */
            cb();
        }
    };
};
