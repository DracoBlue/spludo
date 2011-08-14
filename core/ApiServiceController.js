/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2011 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var inflection = require('inflection');

/**
 * @class A new REST web service controller
 */
ApiServiceController = function(base_path, service_class, options) {
    options = options || {};
    var singular = options.override_singular || {};

    var callServiceMethod = function(cb, method_name, parameters, context) {
        if (typeof service_class[method_name] !== 'function') {
            context.status = 403;
            cb(JSON.stringify({
                'status': false,
                'error': 'Method not found!'
            }));
        } else {
            parameters.unshift(function(status_code, result) {
                if (status_code && status_code !== 200) {
                    context.status = status_code;
                    cb(JSON.stringify({
                        'status': false,
                        'error': result || ''
                    }));
                } else {
                    context.status = 200;
                    cb(JSON.stringify({
                        'status': true,
                        'data': result
                    }));
                }
            });
            service_class[method_name].apply(service_class, parameters);
        }
    };

    new Controller(new RegExp('^' + base_path + '/(.+)/(.+)$'), {
        'execute': function(params, context) {
            return function(cb) {
                var request_method = (context.params['_method'] || context.request.method).toUpperCase();
                if ([
                        'PUT', 'GET', 'DELETE'
                ].indexOf(request_method) === -1) {
                    context.status = 405;
                    context.headers['Allow'] = 'PUT, GET, DELETE';
                    cb(JSON.stringify({
                        'status': false,
                        'error': 'Unsupported Request Method'
                    }));
                    return;
                }
                var entities_name = params[1];
                var entity_id = params[2];
                if (typeof singular[entities_name] === 'undefined') {
                    singular[entities_name] = inflection.singularize(entities_name) || entities_name;
                }
                var entity_name = singular[entities_name];

                var method_name = request_method.toLowerCase() + entity_name.substr(0, 1).toUpperCase() + entity_name.substr(1);
                callServiceMethod(cb, method_name, [
                        entity_id, context.params, context
                ], context);
            };
        }
    });

    new Controller(new RegExp('^' + base_path + '/(.+)/$'), {
        'execute': function(params, context) {
            return function(cb) {
                var request_method = (context.params['_method'] || context.request.method).toUpperCase();
                if (request_method === 'POST') {
                    var entities_name = params[1];
                    if (typeof singular[entities_name] === 'undefined') {
                        singular[entities_name] = inflection.singularize(entities_name) || entities_name;
                    }
                    var entity_name = singular[entities_name];
                    var method_name = request_method.toLowerCase() + entity_name.substr(0, 1).toUpperCase() + entity_name.substr(1);
                    callServiceMethod(cb, method_name, [
                            context.params, context
                    ], context);
                } else if (request_method === 'GET') {
                    var entities_name = params[1];
                    var method_name = request_method.toLowerCase() + entities_name.substr(0, 1).toUpperCase() + entities_name.substr(1);
                    callServiceMethod(cb, method_name, [
                            context.params, context
                    ], context);
                } else {
                    context.status = 405;
                    context.headers['Allow'] = 'POST';
                    cb(JSON.stringify({
                        'status': false,
                        'error': 'Unsupported Request Method'
                    }));
                }
            };
        }
    });
};
