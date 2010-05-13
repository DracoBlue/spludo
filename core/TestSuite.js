/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class A test suite.
 * 
 * @extends Logging
 * 
 * @since 0.1
 * @author DracoBlue
 */
TestSuite = function(name, tests) {
    this.name = name;
    this.tests = [];

    this.resetStats();

    for (i in tests) {
        this.addTest(i, tests[i]);
    }

    test_suite_manager.addTestSuite(name, this);
};

extend(true, TestSuite.prototype, Logging.prototype);

TestSuite.prototype.logging_prefix = 'TestSuite';

TestSuite.prototype.addTest = function(name, test_function) {
    this.tests.push( {
        name: name,
        execute: test_function
    });
};

TestSuite.prototype.resetStats = function() {
    this.stats = {
        assertions: 0,
        assertions_success: 0,
        tests: 0,
        tests_success: 0,
        errors: 0,
        failures: 0
    };
    this.failures = [];
};

TestSuite.prototype.execute = function() {
    var that_suite = this;

    this.resetStats();

    this.current_name = "";

    QUnit.log = function(result, message) {
        if (!result) {
            that_suite.stats.failures++;
            that_suite.failures.push( {
                name: that_suite.current_test_name,
                message: message
            });
        } else {
            that_suite.stats.assertions_success++;
        }
        that_suite.stats.assertions++;
    };

    var tests_count = this.tests.length;

    for ( var i = 0; i < tests_count; i++) {
        var current_test = this.tests[i];
        var stats_before_test = {
            assertions: this.stats.assertions,
            failures: this.stats.failures
        };
        this.current_test_name = current_test.name;
        this.stats.tests++;
        var before_time = (new Date()).getMilliseconds();
        QUnit.test(current_test.name, function() {
            var test_result = current_test.execute();
            if (typeof test_result === 'function') {
                /*
                 * It's an asynchronous test!
                 */
                stop();
                test_result(function() {
                    start();
                });
            }
        });

        if (this.stats.failures != stats_before_test.failures) {
            /*
             * An failure occured :(.
             */
            this.stats.errors++;
        } else {
            this.stats.tests_success++;
        }

        current_test.stats = {
            assertions: this.stats.assertions - stats_before_test.assertions,
            failures: this.stats.failures - stats_before_test.failures,
            "time": ((new Date()).getMilliseconds() - before_time) / 1000
        };

        current_test.stats.assertions_success = current_test.stats.assertions - current_test.stats.failures;
    }
};
