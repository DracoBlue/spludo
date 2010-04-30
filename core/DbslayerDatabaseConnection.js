/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var sys = require("sys");
var http = require("http");

/**
 * @class A class for a connection to an dbslayer database.
 * 
 * @extends Logging
 * 
 * @since 0.1
 * @author DracoBlue
 */
DbslayerDatabaseConnection = function(name, options) {
    var self = this;
    
    var port = options.port || 9090;
    var host = options.host || '127.0.0.1';
    var timeout = options.timeout || 0;
    
    delete options.timeout;
    delete options.port;
    delete options.host;
    
    var db_escape_string = function(string) {
        return string.replace(/([\\\n\r])/g, "\\$&").replace("'", "''", 'g');
    };
    
    var query = function(sql) {
        var connection = http.createClient(port, host);
        
        return function(cb) {
        
            var request = connection.request('GET', '/db?' + escape(JSON.stringify({"SQL":sql})), {'host': host});
    
            request.addListener('response', function(response){
                response.setBodyEncoding("utf8");
                
                var body = [];
                
                response.addListener("data", function (chunk) {
                    body.push(chunk);
                });
                
                response.addListener("end", function () {
                    var data = null;
                    
                    try {
                        data = JSON.parse(body.join(""));
                    } catch(e){
                        cb(true, null, e.message);
                        return ;
                    }
                    
                    if (typeof data.MYSQL_ERROR !== "undefined") {
                        cb(true, data.MYSQL_ERROR, data.MYSQL_ERRNO);
                    } else if (typeof data.ERROR !== "undefined"){
                        cb(true, data.ERROR);
                    } else {
                        var query_result = data.RESULT;
    
                        if (!query_result.ROWS) {
                            if (query_result.SUCCESS) {
                                cb(false);
                            } else {
                                cb(true);
                            }
                            return ;
                        }
                        
                        var headers = query_result.HEADER;
                        
                        var headers_length = headers.length;
    
                        // var types = query_result.TYPES;
                        
                        var rows = query_result.ROWS;
                        var rows_length = rows.length;
                        
                        var results = [];
                        
                        for (r=0; r < rows_length; r++) {
                            var row = {};
                            var raw_row = rows[r];
                            for (h=0; h < headers_length; h++) {
                                row[headers[h]] = raw_row[h];
                            }
                            results.push(row);
                        }
                        
                        cb(false, results);
                    }             
                });
            });
            
            request.close();
        };
    };
    
    this.retrieveByKey = function(element_type_name, key_id, id) {
        return function(cb) {
            query("SELECT * FROM " + db_escape_string(element_type_name) + " WHERE " + db_escape_string(key_id) + "  = '" + db_escape_string(id) + "' LIMIT 1")(function(err, data) {
                if (err) {
                    cb(null);
                    return ;
                }
                
                var elements = data;
                
                if (elements && elements.length === 1) {
                    var element = elements[0];
                    element._table = element_type_name;
                    element._server = name;
                    cb(element);
                } else {
                    cb(null);
                }
            });
        };
    };    
    
    this.retrieveById = function(element_type, id) {
        return this.retrieveByKey(element_type, "id", id);
    };
    
    this.retrieveByKeys = function(element_type_name, key_id, ids, offset, limit) {
        offset = offset || 0;
        // FIXME: how to fix the limit problem, when we just need an offset?
        limit = limit || 230585;
        
        return function(cb) {
            var escaped_ids = [];
            var ids_length = ids.length;
            for (var i=0; i<ids_length; i++) {
                escaped_ids.push("'" + db_escape_string(ids[i]) + "'");
            }
            
            query("SELECT SQL_CALC_FOUND_ROWS * FROM " + db_escape_string(element_type_name) + " WHERE " + db_escape_string(key_id) + "  IN (" + escaped_ids.join(",") + ") LIMIT " + offset + ", " + limit)(function(err, elements) {
                if (err) {
                    cb(null);
                    return ;
                }
                
                if (elements) {
                    var total_count = 0;
                    
                    query("SELECT found_rows() db_connection_found_rows")(function(found_rows_err, found_rows_data) {
                        if (!found_rows_err) {
                            total_count = found_rows_data[0]['db_connection_found_rows'];
                        }
                        
                        var elements_length = elements.length;
                        for (i = 0; i < elements_length; i++) {
                            var element = elements[i];
                            element._table = element_type_name;
                            element._server = name;
                        }
                        cb([elements || [], total_count]);
                    });
                    
                    
                } else {
                    cb([[], 0]);
                }
            });
        };
    };    
    
    this.retrieveByIds = function(element_type, ids) {
        return this.retrieveByKey(element_type, "id", ids);
    };
    
    this.retrieve = function(element_type, offset, limit, filters) {
        return function(cb) {
            var elements = null;
            offset = offset || 0;
            // FIXME: how to fix the limit problem, when we just need an offset?
            limit = limit || 230585;
            
            var where = "";
            
            if (filters && filters.length>0) {
                where = [];
                
                var f = 0;
                for (f = 0; f < filters.length; f++) {
                    where.push(" "+db_escape_string(filters[f][0])+" " + (filters[f][2] || " = ") + " '" + db_escape_string(filters[f][1]) + "'");
                }
                
                where = " WHERE " + where.join(" AND ");
            }
            
            query("SELECT SQL_CALC_FOUND_ROWS * FROM " + db_escape_string(element_type) + where + " LIMIT " + offset + ", " + limit + "")(function(err, data) {
                if (err) {
                    cb(null);
                    return ;
                }
                
                var elements = data;
                
                if (elements) {
                    var total_count = 0;
                    
                    query("SELECT found_rows() db_connection_found_rows")(function(found_rows_err, found_rows_data) {
                        if (!found_rows_err) {
                            total_count = found_rows_data[0]['db_connection_found_rows'];
                        }
                        
                        var elements_length = elements.length;
                        for (i = 0; i < elements_length; i++) {
                            var element = elements[i];
                            element._table = element_type;
                            element._server = name;
                        }
                        cb([elements || [], total_count]);
                    });
                    
                    
                } else {
                    cb([[], 0]);
                }
                
            });
        };
    };
    
    this.deleteByFilter = function(element_type, filters) {
        var where = "";
        
        if (filters && filters.length>0) {
            where = [];
            
            var f = 0;
            for (f = 0; f < filters.length; f++) {
                where.push(" "+db_escape_string(filters[f][0])+" " + (filters[f][2] || " = ") + " '" + db_escape_string(filters[f][1]) + "'");
            }
            
            where = " WHERE " + where.join(" AND ");
        } else {
            throw new Error("The filter cannot be empty!");
        }
        
        return function(cb) {
            query("DELETE FROM " + db_escape_string(element_type) + where)(function(err) {
                if (err) {
                    cb(false);
                    return ;
                }
                
                cb(true);
            });
        };
    };    
    
    this.count = function(element_type) {
        return function(cb) {
            query("SELECT COUNT(*) dbslayer_db_connection_count FROM " + db_escape_string(element_type))(function(err, elements) {
                if (err) {
                    cb(0);
                } else {
                    cb(elements[0]['dbslayer_db_connection_count']);
                }
            });
        };
    };
    
    this.deleteByKey = function(element_type, key_id, id) {
        return function(cb) {
            query("DELETE FROM " + db_escape_string(element_type) + " WHERE " + db_escape_string(key_id) + " = '" + db_escape_string(id) + "' LIMIT 1")(function(err, data) {
                if (err) {
                    throw new Error("Cannot delete entry by id " + id);
                }
                cb();
            });
        };
    };
    
    this.deleteById = function(element_type, id) {
        return this.deleteByKey(element_type, "id", id);
    };
    
    this.createWithKey = function(element, key_id) {
        if (typeof element[key_id] !== "undefined") {
            throw new Error("element id given! We want to create an element, the id should not be given!");
        }

        var table_name = element._table;
        delete element._table;
        
        var keys = [];
        var values = [];
        for (key in element) {
            keys.push('`' + db_escape_string(key) + '`');
            values.push('\'' + db_escape_string(element[key]) + '\'');
        }
        
        return function(cb) {
            query("INSERT INTO " + db_escape_string(table_name) + " (" + keys.join(', ') + ") VALUES (" + values.join(', ') + ")")(function(err, data) {
                cb();
            });
        };
    };    
    
    this.create = function(element) {
        this.createWithKey(element, "id");
    };
    
    this.storeWithKey = function(element, key_id) {
        if (!element || typeof element[key_id] === "undefined") {
            throw new Error("element id not given!");
        }
        
        var table_name = element._table;
        delete element._table;
        
        
        var setters = [];
        for (key in element) {
            if (typeof element[key] !== "string") {
                element[key] = new String(element[key]);
            }
            setters.push('`' + db_escape_string(key) + '` = \'' + db_escape_string(element[key]) + '\'');
        }

        return function(cb) {
            chain(function(chain_cb) {
                query("INSERT INTO " + db_escape_string(table_name) + " (`" + db_escape_string(key_id) + "`) VALUES ('" + db_escape_string(element[key_id]) + "')")(function(err, data) {
                    chain_cb();
                });
            },
            function(chain_cb) {
                query("UPDATE " + db_escape_string(table_name) + " SET " + setters.join(', ') + " WHERE `" + db_escape_string(key_id) + "` = '" + db_escape_string(element[key_id]) + "'")(function(err, data) {
                    chain_cb();
                });
            },
            function() {
                cb();
            });
        };
    };
    
    this.insert = function(element) {
        var table_name = element._table;
        delete element._table;
        
        var keys = [];
        var values = [];
        for (key in element) {
            if (typeof element[key] !== "string") {
                element[key] = new String(element[key]);
            }
            keys.push('`' + db_escape_string(key) + '`');
            values.push('\'' + db_escape_string(element[key]) + '\'');
        }

        return function(cb) {
            query("INSERT INTO " + db_escape_string(table_name) + " (" + keys.join(', ') + ") VALUES (" + values.join(',') + ")")(function(err, data) {
                cb();
            });
        };
    };
    
    this.store = function(element) {
        this.storeWithKey(element, "id");
    };
};

extend(true, DbslayerDatabaseConnection.prototype, DatabaseConnection.prototype);
