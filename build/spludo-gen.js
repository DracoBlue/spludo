/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var sys = require("sys");
var fs = require("fs");
var child_process = require("child_process");
var path = require("path");

try {
    require("./../core");
} catch (error) {
    /*
     * Wasn't able to load core, so we are not in a spludo project
     * and thus can't use all features of spludo-gen
     */
}

require("./../core/util");

var working_directory = process.cwd() + '/';
var spludo_directory = path.dirname(__dirname) + '/';

SpludoGenerator = {};

SpludoGenerator.code_templates = {};

SpludoGenerator.target_directory = working_directory;
SpludoGenerator.working_directory = working_directory;

SpludoGenerator.addCodeTemplate = function(name, options) {
    options.name = name;
    SpludoGenerator.code_templates[name] = options;
};

SpludoGenerator.handleCodeTemplate = function(name) {
    var that = this;
    
    var code_template = this.code_templates[name];
    var parameters = code_template.parameters;
    var parameters_length = parameters.length;
    
    var values_chain = [];
    var values = [];
    
    return function(cb) {
        for (var i = 0; i < parameters_length; i++) {
            (function(parameter) {
                var validate_paramter_handler = function(chain_cb) {
                    
                    var default_value = "";
                    var value = "";
                    
                    chain(function(sub_chain_cb) {
                        code_template.getParameterDefault(parameter.name)(function(err, parameter_default_value) {
                            if (err) {
                                default_value = "";
                            } else {
                                default_value = parameter_default_value;
                            }
                            sub_chain_cb();
                        });
                    }, function(sub_chain_cb) {
                        sys.print(parameter.caption);
                        
                        if (default_value !== "") {
                            sys.print(" [" + default_value + "]");
                        }
                        
                        sys.print(': ');
                        var st = process.openStdin();
                        
                        var data_handler = function(input_value) {
                            st.removeListener("data", data_handler);
                            value = input_value.toString().split("\n")[0];
                            sub_chain_cb();
                        };
                        st.addListener("data", data_handler);
                    }, function() {
                        if (value === "") {
                            value = default_value;
                        }
                        
                        code_template.validateParameter(parameter.name, value, values)(function(err, valid_value) {
                            if (err) {
                                validate_paramter_handler(chain_cb);
                            } else {
                                values.push([parameter.name, valid_value]);
                                chain_cb();
                            }
                        });
                    });
                    
                };
                
                values_chain.push(validate_paramter_handler);
            })(parameters[i]);
        }
        
        values_chain.push(function() {
            sys.puts("  ");
            sys.puts("   Working ... ");
            sys.puts("");
            
            if (typeof code_template.preExecuteHook !== "undefined") {
                code_template.preExecuteHook(values)(function() {
                    that.performCodeTemplate(__dirname + '/code-templates/' + code_template.name + '/', values)(function() {
                        if (typeof code_template.postExecuteHook !== "undefined") {
                            code_template.postExecuteHook(values)(function() {
                                cb();
                            });
                        } else {
                            cb();
                        }
                    });
                });
            } else {
                that.performCodeTemplate(__dirname + '/code-templates/' + code_template.name + '/', values)(function() {
                    if (typeof code_template.postExecuteHook !== "undefined") {
                        code_template.postExecuteHook(values)(function() {
                            cb();
                        });
                    } else {
                        cb();
                    }
                });
            }
            
        });
        
        chain.apply(GLOBAL, values_chain);
    };
};

SpludoGenerator.performCodeTemplate = function(template_directory, values) {
    var that = this;

    values.push(['spludo_directory', spludo_directory]);
    
    var values_length = values.length;
    
    var token_replacer = function(input) {
        var output = input;
        
        for (var i = 0; i < values_length; i++) {
            output = output.split("%%%" + values[i][0] + "%%%").join(values[i][1]);
        }
        
        return output;
    };
    
    var files = [];
    
    return function(cb) {
        
        chain(function(chain_cb) {
            child_process.exec("cd " + template_directory + " && find .", function(err, raw_files) {
                if (err) {
                    /*
                     * Ok, so now files!
                     */
                } else {
                    var raw_files = raw_files.split("\n");
                    var raw_files_length = raw_files.length;
                    for (var i = 0; i < raw_files_length; i++) {
                        var file = raw_files[i].substr(2);
                        if (file !== '') {
                            files.push(file);
                        }
                    }
                }
                chain_cb();
            });
        }, function() {
            var files_length = files.length;
            for (var i = 0; i < files_length; i++) {
                var file = files[i];
                var file_stat = fs.statSync(template_directory + file);
                
                if (file_stat.isDirectory()) {
                    try {
                        fs.mkdirSync(that.target_directory + token_replacer(file), 0755);
                        sys.puts("Created folder: " + that.target_directory + token_replacer(file));
                    } catch (error)
                    {
                        sys.puts("Folder already exists: " + that.target_directory + token_replacer(file));
                    }
                } else {
                    if (path.extname(file) === '.jpg' || path.extname(file) === '.png') {
                        var raw_file_contents = fs.readFileSync(template_directory + file, 'binary').toString();
                        fs.writeFileSync(that.target_directory + token_replacer(file), raw_file_contents, 'binary');
                        sys.puts("Created (binary) file: " + that.target_directory + token_replacer(file));
                    } else {
                        var raw_file_contents = fs.readFileSync(template_directory + file).toString();
                        fs.writeFileSync(that.target_directory + token_replacer(file), token_replacer(raw_file_contents));
                        sys.puts("Created file: " + that.target_directory + token_replacer(file));
                    }
                }
            }
            
            sys.puts("  ");
            sys.puts("   Finished!");
            sys.puts("");
            
            cb();
        });
    };
};

require("./code-templates/core-code-templates");
require("./code-templates/db-code-templates");

var code_template = process.argv[2];

sys.puts("  ");
sys.puts(" Spludo Generator - https://github.com/DracoBlue/spludo");
sys.puts("  ");

if (!code_template || code_template === "help") {
    for (var name in SpludoGenerator.code_templates) {
        sys.puts("    $ spludo-gen " + name);
        sys.puts("      " + SpludoGenerator.code_templates[name].description);
        sys.puts(" ");
    }
    process.exit(0);
}

sys.puts("   Template: " + code_template);
sys.puts("");


if (typeof SpludoGenerator.code_templates[code_template] === "undefined") {
    sys.puts("   Error: Unsupported code template: " + code_template);
    process.exit(1);
}

SpludoGenerator.handleCodeTemplate(code_template)(function() {
    process.exit(0);
});
