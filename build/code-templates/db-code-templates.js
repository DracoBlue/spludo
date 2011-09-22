/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2011 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var sys = require("sys");
var fs = require("fs");
var path = require("path");
var child_process = require("child_process");

SpludoGenerator.addCodeTemplate("migration-create-table", {
    description: "Create a migration, which creates a database table.",

    parameters: [
        {
            "name": "database_connection_name",
            "caption": "The database connection name"
        },
        {
            "name": "table_name",
            "caption": "The database table name (e.g. users)"
        },
        {
            "name": "fields",
            "caption": "The fields of the table"
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
            } else if (name === "table_name") {
                if (value.length === 0) {
                    sys.puts("Please type in a database!");
                    cb(true);
                    return ;
                }
                
                database = database_manager.getDatabase(validated_values["database_connection_name"]);
                database.getTableMeta(value)(function(error, meta_data) {
                    if (error) {
                        cb(false, value);
                    } else {
                        sys.puts("Table already exists!");
                        cb(true);
                    }
                });
            } else if (name === "fields") {
                if (value.length === 0) {
                    sys.puts("Please type in fields for the table!");
                    cb(true);
                    return ;
                }
                
                cb(false, value);
            } else {
                cb(true);
            }
        };
    },

    getParameterDefault: function(name) {
        return function(cb) {
            if (name === 'database_connection_name') {
                cb(false, "default");
            } else if (name === 'fields') {
               cb(false, "name:varchar(255) description:text create_date:datetime");
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

            var toUpperCamelCase = function(input) {
                var result_parts = [];
                input.split('_').forEach(function(part_name, pos) {
                    part_name = part_name.toLowerCase();
                    part_name = part_name.substr(0,1).toUpperCase() + part_name.substr(1);
                    
                    result_parts.push(part_name);
                });
                return result_parts.join('');
            };
            
            values_object['table_name_camel_case'] = toUpperCamelCase(values_object['table_name']);
            values.push(['table_name_camel_case', values_object['table_name_camel_case']]);

            var pad = function (n){
                return n<10 ? '0'+n : n;
            };
            
            var d = new Date();
            values_object['time_stamp'] = d.getUTCFullYear() + pad(d.getUTCMonth()+1) + pad(d.getUTCDate());
            values_object['time_stamp'] = values_object['time_stamp'] + pad(d.getUTCHours()) + pad(d.getUTCMinutes());
            values.push(['time_stamp', values_object['time_stamp']]);
            
            var fields = {};
            
            var fields_raw = values_object['fields'].trim().split(" ");
            var fields_data = [];

            fields["id"] = {
                "type": "INTEGER",
                "primary": true
            };

            fields_raw.forEach(function(field_raw) {
                field_raw = field_raw.trim();
                var field_raw_parts = field_raw.split(":");
                var field_name = field_raw_parts[0];
                var field_type = field_raw_parts[1] || 'varchar(255)';
                var field_type_parts = field_type.match(/^(.+)\((.+)\)$/);
                var field_type_name = field_type;
                var field_type_size = null;
                
                if (field_type_parts) {
                    field_type_name = field_type_parts[1];
                    field_type_size = parseInt(field_type_parts[2], 10);
                }
                
                fields[field_name] = fields[field_name] || {};
                
                fields[field_name]["type"] = field_type_name.toUpperCase();
                if (field_type_size !== null) {
                    fields[field_name]["type_size"] = field_type_size;
                }
            });
            
            if (fields["id"]["type"] === 'INTEGER' || fields["id"]["type"] === 'BIGINT') {
                fields["id"]["auto_increment"] = true;
            }
            
            for (var field_name in fields) {
                var data_line = "'" + field_name + "': " + JSON.stringify(fields[field_name]);
                fields_data.push(data_line);
            }
            
            values_object['fields_data'] = fields_data.join(",\n            ");
            values.push(['fields_data', values_object['fields_data']]);
            
            cb();
        };
    },    
    
    postExecuteHook: function(values) {
        return function(cb) {
            var values_object = {};
            
            values.forEach(function(pair) {
                values_object[pair[0]] = pair[1];
            });
            
            sys.puts("   Execute your new migration now with:");
            sys.puts("   ");
            sys.puts("      $ ant db:migrate");
            sys.puts("");
            
            cb();
        };
    }
});

SpludoGenerator.addCodeTemplate("migration-add-column", {
    description: "Create a migration, which adds a column to a database table.",

    parameters: [
        {
            "name": "database_connection_name",
            "caption": "The database connection name"
        },
        {
            "name": "table_name",
            "caption": "The database table name (e.g. users)"
        },
        {
            "name": "column_name",
            "caption": "The new column (e.g. first_name)"
        },
        {
            "name": "column_type",
            "caption": "Type of the column (e.g. INTEGER, VARCHAR, TEXT)"
        },
        {
            "name": "column_type_size",
            "caption": "Type size of the column (e.g. 255, null)"
        },
        {
            "name": "default_value",
            "caption": "The default value (e.g. Default Text, null)"
        },
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
            } else if (name === "table_name") {
                if (value.length === 0) {
                    sys.puts("Please type in a database!");
                    cb(true);
                    return ;
                }
                
                database = database_manager.getDatabase(validated_values["database_connection_name"]);
                database.getTableMeta(value)(function(error, meta_data) {
                    if (error) {
                        sys.puts("Table does not exist!");
                        cb(true);
                    } else {
                        cb(false, value);
                    }
                });
            } else if (name === "column_name") {
                if (value.length === 0) {
                    sys.puts("Please type in a column name!");
                    cb(true);
                    return ;
                }
                database = database_manager.getDatabase(validated_values["database_connection_name"]);
                database.getTableMeta(validated_values["table_name"])(function(error, meta_data) {
                    var meta_data_length = meta_data.length;
                    for (var i = 0; i < meta_data_length; i++) {
                        if (meta_data[i].name === value) {
                            sys.puts("Column already exists!");
                            cb(true);
                            return ;
                        }
                    }
                    cb(false, value);
                });
            } else if (name === "column_type") {
                if (value.length === 0) {
                    sys.puts("Please type in a column type!");
                    cb(true);
                    return ;
                }
                cb(false, value);
            } else if (name === "column_type_size") {
                if (value.length === 0) {
                    sys.puts("Please type in a column type size or null!");
                    cb(true);
                    return ;
                }
                cb(false, value);
            } else if (name === "default_value") {
                if (value.length === 0) {
                    sys.puts("Please type in a default value or null!");
                    cb(true);
                    return ;
                }
                cb(false, value);
            } else {
                cb(true);
            }
        };
    },

    getParameterDefault: function(name) {
        return function(cb) {
            if (name === 'database_connection_name') {
                cb(false, "default");
            } else if (name === 'default_value') {
                cb(false, "null");
            } else if (name === 'column_type') {
                cb(false, "VARCHAR");
            } else if (name === 'column_type_size') {
                cb(false, "255");
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

            var toUpperCamelCase = function(input) {
                var result_parts = [];
                input.split('_').forEach(function(part_name, pos) {
                    part_name = part_name.toLowerCase();
                    part_name = part_name.substr(0,1).toUpperCase() + part_name.substr(1);
                    
                    result_parts.push(part_name);
                });
                return result_parts.join('');
            };
            
            values_object['table_name_camel_case'] = toUpperCamelCase(values_object['table_name']);
            values.push(['table_name_camel_case', values_object['table_name_camel_case']]);

            values_object['column_name_camel_case'] = toUpperCamelCase(values_object['column_name']);
            values.push(['column_name_camel_case', values_object['column_name_camel_case']]);

            if (values_object['column_type_size'].toLowerCase() === 'null') {
                values_object['column_type_size'] = null;
            }
            
            if (values_object['default_value'].toLowerCase() === 'null') {
                values_object['default_value'] = null;
            }            
            
            values_object['column_definition'] = JSON.stringify({
                'type': values_object['column_type'],
                'type_size': values_object['column_type_size'],
                'default': values_object['default_value']
            });
            values.push(['column_definition', values_object['column_definition']]);
            
            var pad = function (n){
                return n<10 ? '0'+n : n;
            };

            var d = new Date();
            values_object['time_stamp'] = d.getUTCFullYear() + pad(d.getUTCMonth()+1) + pad(d.getUTCDate());
            values_object['time_stamp'] = values_object['time_stamp'] + pad(d.getUTCHours()) + pad(d.getUTCMinutes());
            values.push(['time_stamp', values_object['time_stamp']]);

            values_object['file_name'] = values_object["time_stamp"] + "_Add" + values_object["column_name_camel_case"] + 'To';
            values_object['file_name'] = values_object['file_name'] + values_object['table_name_camel_case'] + '.js';
            values.push(['file_name', values_object['file_name']]);
            
            cb();
        };
    },    
    
    postExecuteHook: function(values) {
        return function(cb) {
            var values_object = {};
            
            values.forEach(function(pair) {
                values_object[pair[0]] = pair[1];
            });
            
            
            sys.puts("   You may modify your migration file at:");
            sys.puts("   ");
            sys.puts("      dev/migrations/" + values_object["database_connection_name"] + "/" + values_object['file_name']);
            sys.puts("");
            sys.puts("   or execute it right away with:");
            sys.puts("   ");
            sys.puts("      $ ant db:migrate");
            sys.puts("");
            
            cb();
        };
    }
});