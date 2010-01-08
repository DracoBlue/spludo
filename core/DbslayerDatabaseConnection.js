/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
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
        return string.replace(/'/g, "''");
    };
    
    var query = function(sql) {
        var connection = http.createClient(port, host);
        
        var promise = new process.Promise();
        var request = connection.request('GET', '/db?' + escape(JSON.stringify({"SQL":sql})), {'host': host});
//        var request = connection.request('GET', "/", {'host': host});
        
        if (timeout !== 0) {
            promise.timeout(timeout);
        }

        request.finish(function(response){
            response.setBodyEncoding("binary");
            
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
    
    this.retrieveById = function(element_type, id) {
        var elements = null;
        var p = query("SELECT * FROM " + element_type + " WHERE id = '" + id + "' LIMIT 1");
        
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
    
    this.retrieve = function(element_type, offset, limit) {
        var elements = null;
        offset = offset || 0;
        // FIXME: how to fix the limit problem, when we just need an offset?
        limit = limit || 230585;
        
        var p = query("SELECT * FROM " + element_type + " ORDER BY id DESC LIMIT " + offset + ", " + limit + "");
        
        p.addCallback(function(data) {
            elements = data;
        });
        
        p.addErrback(function(data) {
            elements = null;
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
        
        return elements || [];
    };
    
    this.deleteById = function(element_type, id) {
        var had_error = false;
        var p = query("DELETE FROM " + element_type + " WHERE id = '" + id + "' LIMIT 1");
        
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
    
    this.create = function(element) {
        sys.debug(sys.inspect(element));
        if (typeof element.id !== "undefined") {
            throw new Error("element id given! We want to create an element, the id should not be given!");
        }

        var table_name = element._table;
        delete element._table;
        
        var keys = [];
        var values = [];
        for (key in element) {
            // FIXME: SQL ESCAPING FOR KEYS!
            keys.push('`' + key + '`');
            values.push('\'' + db_escape_string(element[key]) + '\'');
        }

        p = query("INSERT INTO " + table_name + " (" + keys.join(', ') + ") VALUES (" + values.join(', ') + ")");
        p.wait();
    };    
    
    this.store = function(element) {
        if (!element || typeof element.id === "undefined") {
            throw new Error("element id not given!");
        }

        var table_name = element._table;
        delete element._table;
        
        var setters = [];
        for (key in element) {
            // FIXME: SQL ESCAPING FOR KEYS!
            setters.push('`' + key + '` = \'' + db_escape_string(element[key]) + '\'');
        }

        var p = null;
        try {
            p = query("INSERT INTO " + table_name + " (`id`) VALUES ('" + element.id + "')");
            p.wait();
        } catch (e) {
            /*
             * We do not care if that fails ;). The fact is, that we just want to secure that the entry exists.
             */
        }
        p = query("UPDATE " + table_name + " SET " + setters.join(', ') + " WHERE `id` = '" + element.id + "'");
        p.wait();
    };
};

process.mixin(true, DbslayerDatabaseConnection.prototype, DatabaseConnection.prototype);