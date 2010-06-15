/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var sys = require("sys");
var fs = require("fs");
var path = require("path");

SpludoGenerator.addCodeTemplate("new-project", {
    description: "Create a new plain spludo project.",

    parameters: [
        {
            "name": "project.name",
            "caption": "Name of the Project (e.g. myapp)"
        },
        {
            "name": "spludo.directory",
            "caption": "Spludo Directory"
        }
    ],

    validateParameter: function(name, value) {
        return function(cb) {
            if (name === "project.name") {
                if (!value.toLowerCase().match(/^[a-z0-9\_\-]+$/)) {
                    sys.puts("Unsupported project name (expected: [a-z0-9\\_\\-]+): " + value);
                    cb(true);
                } else {
                    var project_directory = SpludoGenerator.working_directory + value + '/';

                    try {
                        var file_stat = fs.statSync(project_directory);
                        sys.puts("Folder already exists: " + project_directory);
                        cb(true);
                    } catch (e) {
                        /*
                         * Yay, it fails so it should not exist yet.
                         */
                        SpludoGenerator.target_directory = project_directory;
                        cb(false, value);
                    }
                }
            } else if (name === "spludo.directory") {
                try {
                    /*
                     * Let's check some files which are usually in a spludo installation.
                     */
                    var file_stat = fs.statSync(value);
                    if (!file_stat.isDirectory()) {
                        throw new Error("Spludo directory is not a directory!");
                    }
                    file_stat = fs.statSync(value + 'core');
                    if (!file_stat.isDirectory()) {
                        throw new Error("Spludo's core directory is not a directory!");
                    }
                    fs.statSync(value + 'build/spludo-gen.js');
                    fs.statSync(value + 'core/index.js');
                    cb(false, value);
                } catch (e) {
                    sys.puts("This is no spludo installation at: " + value);
                    cb(true);
                }
            } else {
                cb(true);
            }
        };
    },

    getParameterDefault: function(name) {
        return function(cb) {
            if (name === "spludo.directory") {
                cb(false, path.dirname(path.dirname(__dirname)) + '/');
            } else {
                cb(true, "");
            }
        };
    },

    preExecuteHook: function(values) {
        return function(cb) {
            try {
                fs.mkdirSync(SpludoGenerator.target_directory, 0755);
            } catch (exception) {
                sys.puts("Could not create project directory: " + exception.message);
                process.exit(1);
            }
            sys.puts("Directory created: " + SpludoGenerator.target_directory);
            cb();
        }
    }
});
