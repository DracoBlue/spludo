/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var sys = require("sys");

/**
 * @class A class for a connection to an dbslayer database.
 * 
 * @extends Logging
 * 
 * @since 0.1
 * @author DracoBlue
 */
DbslayerDatabaseConnection = function(name, options) {

    var port = options.port || 9090;
    var host = options.host || '127.0.0.1';
    var timeout = options.timeout || 0;
    
    delete options.timeout;
    delete options.port;
    delete options.host;
    
    var http = require("http");
    
    var db_escape_string = function(string) {
        return string.replace(/([\n\r\'\"])/g, "\\$&");
    };
    
    var query = function(sql) {
        var connection = http.createClient(port, host);
        
        var promise = new process.Promise();
        var request = connection.request('GET', '/db?' + escape(JSON.stringify({"SQL":sql})), {'host': host});
        
        if (timeout !== 0) {
            promise.timeout(timeout);
        }

        request.finish(function(response){
            response.setBodyEncoding("utf8");
            
            var body = [];
            
            response.addListener("body", function (chunk) {
                body.push(chunk);
            });
            
            response.addListener("complete", function () {
                var data = null;
                
                try {
                    data = JSON.parse(body.join(""));
                } catch(e){
                    promise.emitError(null, e.message);
                    return ;
                }
                
                if (typeof data.MYSQL_ERROR !== "undefined") {
                    promise.emitError(data.MYSQL_ERROR, data.MYSQL_ERRNO);
                } else if (typeof data.ERROR !== "undefined"){
                    promise.emitError(data.ERROR);
                } else {
                    var query_result = data.RESULT;

                    if (!query_result.ROWS) {
                        if (query_result.SUCCESS) {
                            promise.emitSuccess();
                        } else {
                            promise.emitError();
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
                    
                    promise.emitSuccess(results);
                }             
            });
        });
        
        return promise;
    };
    
    this.retrieveByKey = function(element_type, key_id, id) {
        var elements = null;
        var p = query("SELECT * FROM " + db_escape_string(element_type) + " WHERE " + db_escape_string(key_id) + "  = '" + db_escape_string(id) + "' LIMIT 1");
        
        p.addCallback(function(data) {
            elements = data;
        });
        
        p.addErrback(function(data) {
            elements = null;
        });
        
        p.wait();
        
        if (elements && elements.length === 1) {
            var element = elements[0];
            element._table = element_type;
            element._server = name;
            return element;
        }
        
        return null;
    };    
    
    this.retrieveById = function(element_type, id) {
        return this.retrieveByKey(element_type, "id", id);
    };
    
    this.retrieve = function(element_type, offset, limit, filters) {
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
        
        var p = query("SELECT SQL_CALC_FOUND_ROWS * FROM " + db_escape_string(element_type) + where + " LIMIT " + offset + ", " + limit + "");
        
        p.addCallback(function(data) {
            elements = data;
        });
        
        p.addErrback(function(data) {
            elements = null;
        });
        
        p.wait();
        
        var total_count = 0;
        
        p = query("SELECT found_rows() db_connection_found_rows");
        
        p.addCallback(function(data) {
            total_count = data[0]['db_connection_found_rows'];
        });
        
        p.addErrback(function(data) {
            total_count = 0;
        });
        
        p.wait();
        
        if (elements) {
            var elements_length = elements.length;
            for (i = 0; i < elements_length; i++) {
                var element = elements[i];
                element._table = element_type;
                element._server = name;
            }
        }
        
        return [elements || [], total_count];
    };
    
    this.count = function(element_type) {
        var elements = null;
        
        var p = query("SELECT COUNT(*) dbslayer_db_connection_count FROM " + db_escape_string(element_type));
        
        p.addCallback(function(data) {
            elements = data;
        });
        
        p.addErrback(function(data) {
            elements = null;
        });
        
        p.wait();
        
        if (elements) {
            var elements_length = elements.length;
            return elements[0]['dbslayer_db_connection_count'];
        }
        
        return 0;
    };
    
    this.deleteByKey = function(element_type, key_id, id) {
        var had_error = false;
        var p = query("DELETE FROM " + db_escape_string(element_type) + " WHERE " + db_escape_string(key_id) + " = '" + db_escape_string(id) + "' LIMIT 1");
        
        p.addCallback(function(data) {
            had_error = false;
        });
        
        p.addErrback(function(data) {
            had_error = true;
        });
        
        p.wait();
        
        if (had_error) {
            throw new Error("Cannot delete entry by id " + id);
        }
    };
    
    this.deleteById = function(element_type, id) {
        return this.deleteByKey(element_type, "id", id);
    };
    
    this.createWithKey = function(element, key_id) {
        sys.debug(sys.inspect(element));
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

        p = query("INSERT INTO " + db_escape_string(table_name) + " (" + keys.join(', ') + ") VALUES (" + values.join(', ') + ")");
        p.wait();
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
            setters.push('`' + db_escape_string(key) + '` = \'' + db_escape_string(element[key]) + '\'');
        }

        var p = null;
        try {
            p = query("INSERT INTO " + db_escape_string(table_name) + " (`" + db_escape_string(key_id) + "`) VALUES ('" + db_escape_string(element[key_id]) + "')");
            p.wait();
        } catch (e) {
            /*
             * We do not care if that fails ;). The fact is, that we just want to secure that the entry exists.
             */
        }
        p = query("UPDATE " + db_escape_string(table_name) + " SET " + setters.join(', ') + " WHERE `" + db_escape_string(key_id) + "` = '" + db_escape_string(element[key_id]) + "'");
        p.wait();
    };
    
    this.store = function(element) {
        this.storeWithKey(element, "id");
    };
};

process.mixin(true, DbslayerDatabaseConnection.prototype, DatabaseConnection.prototype);
