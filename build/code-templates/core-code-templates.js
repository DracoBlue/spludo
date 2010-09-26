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
var child_process = require("child_process");

SpludoGenerator.addCodeTemplate("new-project", {
    description: "Create a new plain spludo project.",

    parameters: [
        {
            "name": "project.name",
            "caption": "Name of the Project Folder (e.g. myapp)"
        },
        {
            "name": "project.title",
            "caption": "Title of the Project (e.g. My Super App)"
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
            } else if (name === "project.title") {
                    if (!value.toLowerCase().match(/^[A-Za-z0-9\ \_\-]+$/)) {
                        sys.puts("Unsupported project title (expected: [A-Za-z0-9\\ \\_\\-]+): " + value);
                        cb(true);
                    } else {
                        cb(false, value);
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
        };
    },

    postExecuteHook: function(values) {
        return function(cb) {
            child_process.exec('chmod +x "' + SpludoGenerator.target_directory + 'run_dev_server.bash"', function(error) {
                if (error) {
                    sys.puts("Could chmod run_dev_server.bash");
                    process.exit(1);
                    return ;
                }

                sys.puts("   Launch with this 2 steps:");
                sys.puts("      $ cd " + SpludoGenerator.target_directory);
                sys.puts("      $ ./run_dev_server.bash");
                sys.puts("");
                
                cb();
            });
        };
    }
});

SpludoGenerator.addCodeTemplate("controller", {
    description: "Create a new controller for your application.",

    parameters: [
        {
            "name": "controller.path",
            "caption": "The path to match for this controller (e.g. string 'entries/list' \n or as regular expression '/^entries\\/view\\/\\d+$/')"
        },
        {
            "name": "controller.file",
            "caption": "File where to store the controller"
        },
        {
            "name": "plugin.name",
            "caption": "Plugin to use (e.g. myplugin, keep empty for core)"
        }
    ],

    validateParameter: function(name, value) {
        return function(cb) {
            if (name === "controller.path") {
                if (value.substr(0, 1) === '/') {
                    try {
                        new Function('return ' + value)();
                    } catch (error) {
                        sys.puts("Unsupported regular expression: " + value);
                        cb(true);
                        return ;
                    }
                    cb(false, value);
                } else {
                    cb(false, JSON.stringify(value));
                }
            } else if (name === "plugin.name") {
                    if (value === '') {
                        cb(false, value);
                    } else {
                        try {
                            /*
                             * Let's check some files which are usually in a spludo installation.
                             */
                            var file_stat = fs.statSync(SpludoGenerator.target_directory + 'plugins/' + value);
                            if (!file_stat.isDirectory()) {
                                throw new Error("The plugin directory is not a directory!");
                            }
                            cb(false, value);
                        } catch (e) {
                            sys.puts("The plugin " + value + " does not exist.");
                            cb(true);
                        }
                    }
            } else if (name === "controller.file") {
                if (value.substr(-3) !== '.js') {
                    sys.puts("Unsupported file extension. Controller files must end with .js always.");
                    cb(true);
                } else {
                    cb(false, value);
                }
            } else {
                cb(true);
            }
        };
    },

    getParameterDefault: function(name) {
        return function(cb) {
            if (name === 'controller.file') {
                cb(false, "main-controllers.js");
            } else {
                cb(true, "");
            }
        };
    },

    preExecuteHook: function(values) {
        return function(cb) {
            var values_object = {};
            
            values.forEach(function(pair) {
                values_object[pair[0]] = pair[1];
            });
            
            var controllers_folder = 'controllers/';
            if (values_object['plugin.name'] !== '')
            {
                controllers_folder = 'plugins/' + values_object['plugin.name'] + '/controllers/';
            }
            
            controllers_folder = SpludoGenerator.target_directory + controllers_folder;
            
            try {
                fs.mkdirSync(controllers_folder, 0755);
            } catch (error) {
                /*
                 * If we fail, the folder existed hopefully.
                 */
            }
            var controller_file_name = controllers_folder + values_object['controller.file'];
            fs.stat(controller_file_name, function (err, stats) {
                var new_controller_source = "new Controller(" + values_object['controller.path'] + ", {\n" +
                		"    execute: function(params, context, inner) {\n" +
                		"        return function(cb) {\n" +
                        "            // context.view_name = 'ChooseYourView';\n" +
                		"            context.layout_name = 'HtmlLayout';\n" +
                		"            cb();\n" +
                		"        };\n" +
                		"    }\n" +
                		"});\n" +
                		"\n";
                var file_content_handler = function() {
                    fs.writeFile(controller_file_name, new_controller_source, function (err, data) {
                        if (err) {
                            throw new Error('Unable to write the file, at: ' + controller_file_name);
                        }
                        cb();
                    });
                };
                
                if (err) {
                    /*
                     * File does not exist, yet
                     */
                    sys.puts('Creating a new controller file at ' + values_object['controller.file']);
                    file_content_handler();
                } else {
                    sys.puts('Modifying the existing file at ' + values_object['controller.file']);
                    /*
                     * File is there!
                     */
                    fs.readFile(controller_file_name, function (err, data) {
                        if (err) {
                            throw new Error('Unable to read the file, which should exist at: ' + controller_file_name);
                        }
                        new_controller_source = data.toString() + "\n\n" + new_controller_source;
                        file_content_handler();
                    });
                }
            });
        };
    },
    
    postExecuteHook: function(values) {
        return function(cb) {
            var values_object = {};
            
            values.forEach(function(pair) {
                values_object[pair[0]] = pair[1];
            });
            
            var controller_folder = 'controllers/';
            if (values_object['plugin.name'] !== '')
            {
                controller_folder = 'plugins/' + values_object['plugin.name'] + '/controllers/';
            }
            
            sys.puts("   Edit your new controller now with:");
            sys.puts("      $ vim " + controller_folder + values_object['controller.file']);
            sys.puts("");
            sys.puts("   You can view the result in your browser at: " + values_object['controller.path']);
            sys.puts("");
            
            cb();
        };
    }
});
