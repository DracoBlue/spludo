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
var inflection = require("inflection");

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



SpludoGenerator.addCodeTemplate("service", {
    description: "Create a new service for your application.",

    parameters: [
        {
            "name": "database_connection_name",
            "caption": "The database connection name"
        },
        {
            "name": "service_name",
            "caption": "The name for your service (e.g. User)"
        },
        {
            "name": "database_table_name",
            "caption": "The database table name (e.g. users)"
        },
        {
            "name": "id_key",
            "caption": "The table field for the id"
        }
    ],

    validateParameter: function(name, value, validated_values_array) {
        return function(cb) {
            var database = null;
            var validated_values = {};
            validated_values_array.forEach(function(validated_value_data) {
                validated_values[validated_value_data[0]] = validated_value_data[1];
            });

            if (name === "database_connection_name") {
                try {
                    database = database_manager.getDatabase(value);
                    cb(false, value);
                } catch (error) {
                    sys.puts("This database connection is not configured!");
                    cb(true);
                }
            } else if (name === "service_name") {
                if (value.length === 0) {
                    sys.puts("Please type in a name!");
                    cb(true);
                    return ;
                }
                
                if (value.substr(0, 1).toUpperCase() != value.substr(0, 1))
                {
                    sys.puts("First character must be upper case!");
                    cb(true);
                    return ;
                }
                
                cb(false, value);
            } else if (name === "database_table_name") {
                database = database_manager.getDatabase(validated_values["database_connection_name"]);

                database.getTableMeta(value)(function(error, meta_data) {
                    if (error) {
                        sys.puts("Database found, but could not get table meta data for: " + value);
                        cb(true);
                    } else {
                        cb(false, value);
                    }
                });
            } else if (name === "id_key") {
                database = database_manager.getDatabase(validated_values["database_connection_name"]);
                database.getTableMeta(validated_values["database_table_name"])(function(error, meta_data) {
                    var is_id_key_available = false;

                    meta_data.forEach(function(meta_data_field) {
                        if (meta_data_field.name == value) {
                            is_id_key_available = true;
                        }
                    });
                        
                    if (is_id_key_available) {
                        cb(false, value);
                    } else {
                        sys.puts("Database and Table found, but could not find field: " + value);
                        cb(true);
                    }
                });
            } else {
                cb(true);
            }
        };
    },

    getParameterDefault: function(name) {
        return function(cb) {
            if (name === 'database_connection_name') {
                cb(false, "default");
            } else if (name === 'id_key') {
               cb(false, "id");
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

            var toCamelCase = function(input) {
                var result_parts = [];
                input.split('_').forEach(function(part_name, pos) {
                    part_name = part_name.toLowerCase();
                    if (pos != 0)
                    {
                        part_name = part_name.substr(0,1).toUpperCase() + part_name.substr(1);
                    }
                    result_parts.push(part_name);
                });
                return result_parts.join('');
            };

            var service_name = values_object['service_name'];
            var service_name_lower_case = service_name.toLowerCase();
            
            values_object['service_name_lower_case'] = service_name_lower_case;
            values.push(['service_name_lower_case', values_object['service_name_lower_case']]);
            values_object['service_name_plural_lower_case'] = inflection.pluralize(service_name_lower_case) || service_name_lower_case;
            values.push(['service_name_plural_lower_case', values_object['service_name_plural_lower_case']]);
            values_object['service_name_plural'] = inflection.pluralize(service_name) || service_name;
            values.push(['service_name_plural', values_object['service_name_plural']]);

            var database = database_manager.getDatabase(values_object["database_connection_name"]);

            database.getTableMeta(values_object["database_table_name"])(function(error, meta_data) {
                var service_object_definition_parts = [];

                var has_already_id_field = false;

                meta_data.forEach(function(field) {
                    if (field.name === 'id') {
                        has_already_id_field = true;
                    }
                });

                if (values_object["id_key"] !== "id" && !has_already_id_field) {
                    meta_data.unshift({
                        "name": "id"
                    });
                }

                meta_data.forEach(function(field) {
                    var field_name = field.name;
                    var getter_name = toCamelCase("get_" + field.name);

                    if (field_name === "id") {
                        field_name = values_object["id_key"];
                    }
                    
                    var field_parts = [];
                    service_object_definition_parts.push("");
                    service_object_definition_parts.push(values_object['service_name'] + ".prototype." + getter_name + " = function() {");
                    service_object_definition_parts.push("    return this.values['" + field_name +"'];");
                    service_object_definition_parts.push("};");
                });
                values.push(['service_object_definition', service_object_definition_parts.join("\n")]);
                
                fs.readFile(SpludoGenerator.target_directory + 'config.js', function(error, data_buffer) {
                    if (error) {
                        sys.puts("Oops, failed while reading the config.js. Please create a blank config.js file in your project directory.");
                        process.exit(1);
                        return ;
                    }
                    var data_string = "config.setPathValue([" + JSON.stringify(values_object['service_name_lower_case']);
                    data_string = data_string + ", \"database_connection\"], " + JSON.stringify(values_object["database_connection_name"])
                    data_string = data_string + ");\n" + data_buffer.toString();
                    fs.writeFile(SpludoGenerator.target_directory + 'config.js', data_string, function(error) {
                        if (error) {
                            sys.puts("Oops, failed to write the service config in config.js. Please make sure it's writeable!");
                            process.exit(1);
                        }
                        cb();
                    });
                });
            });
        };
    },    
    
    postExecuteHook: function(values) {
        return function(cb) {
            var values_object = {};
            
            values.forEach(function(pair) {
                values_object[pair[0]] = pair[1];
            });
            
            sys.puts("   User your new service now with:");
            sys.puts("   ");
            sys.puts("      var " + values_object['service_name_lower_case'] + "_service = service_manager.get('" + values_object['service_name'] + "');");
            sys.puts("      " + values_object['service_name_lower_case'] + "_service.get" + values_object['service_name'] + 'ById(function(' + values_object['service_name_lower_case'] + ') {');
            sys.puts('          console.log(' + values_object['service_name_lower_case'] + ');');
            sys.puts("      }, 1234);");
            sys.puts("");
            
            cb();
        };
    }
});
