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
 */
TestSuite = function(name, tests) {
    this.name = name;
    this.tests = [];

    this.resetStats();
    
    for (var i in tests) {
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
    var that = this;

    var current_test;
    
    var executedTestsHandler = function(current_test, stats_before_test, before_time, cb) {
        if (that.stats.failures != stats_before_test.failures) {
            /*
             * An failure occured :(.
             */
            that.stats.errors++;
        } else {
            that.stats.tests_success++;
        }

        current_test.stats = {
            assertions: that.stats.assertions - stats_before_test.assertions,
            failures: that.stats.failures - stats_before_test.failures,
            "time": ((new Date()).getMilliseconds() - before_time) / 1000
        };

        current_test.stats.assertions_success = current_test.stats.assertions - current_test.stats.failures;
        that.log('Finished test: ' + current_test.name);
        cb();
    };
    
    return function(cb) {
        that.resetStats();
        
        that.log('Running test suite: ' + that.name);
    
        that.current_name = "";
    
        QUnit.log = function(result, message) {
            if (!result) {
                that.stats.failures++;
                that.failures.push( {
                    name: that.current_test_name,
                    message: message
                });
            } else {
                that.stats.assertions_success++;
            }
            that.stats.assertions++;
        };
    
        var tests_count = that.tests.length;
        
        var tests_chain = [];
        
        that.tests.forEach(function(current_test) {
            tests_chain.push(function(chain_cb) {
                that.log('Running test:' + current_test.name);
                var stats_before_test = {
                        assertions: that.stats.assertions,
                        failures: that.stats.failures
                };
                that.current_test_name = current_test.name;
                that.stats.tests++;
                var before_time = (new Date()).getMilliseconds();
                var test_result = current_test.execute.apply(that, []);
                if (typeof test_result === 'function') {
                    /*
                     * It's an asynchronous test!
                     */
                    test_result(function() {
                        executedTestsHandler(current_test, stats_before_test, before_time, chain_cb);
                    });
                } else {
                    executedTestsHandler(current_test, stats_before_test, before_time, chain_cb);
                }
            });            
        });
    
        tests_chain.push(function() {
            that.log('Finished test suite: ' + that.name);
            cb();
        });
        
        chain.apply(GLOBAL, tests_chain);
    };
};
