/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

/**
 * @class A layout, which can be used to define default behavior for headers or
 *        inject/wrap special formatting to a view output
 * 
 * @param {Object}
 *            options Options to specify the behaviour
 * @param {Array|null}
 *            options.before The controller(name)s, which should be rendered before the content
 * @param {Array|null}
 *            options.after The controller(name)s, which should be rendered before the content
 * @param {Object|null}
 *            options.headers The headers, which should be set
 * @param {Function|null}
 *            options.wrap The function, which should be called to wrap around the content.
 * 
 * @since 0.1
 * @author DracoBlue
 */
Layout = function(name, options) {
    this.before = options.before || null;
    this.after = options.after || null;
    this.headers = options.headers || null;
    this.wrap = options.wrap || null;
    this.name = name;

    layout_manager.addLayout(name, this);
};

Layout.prototype.render = function(content, params, context) {
    var result = [];
    var i = 0;

    if (this.before !== null) {
        /*
         * We have to display something before the content starts.
         */
        var before_length = this.before.length;
        for (i = 0; i < before_length; i++) {
            if (typeof this.before[i] == "string") {
                result.push(BaseApplication.executePath(this.before[i]));
            } else {
                throw new Error("Nothing except string's supported for before/after elements, yet!");
            }
        }
    }

    if (this.wrap !== null) {
        content = this.wrap(this, content, params, context);
    }

    result.push(content);

    if (this.after !== null) {
        /*
         * We have to display something before the content starts.
         */
        var after_length = this.after.length;
        for (i = 0; i < after_length; i++) {
            if (typeof this.after[i] == "string") {
                result.push(BaseApplication.executePath(this.after[i]));
            } else {
                throw new Error("Nothing except string's supported for before/after elements, yet!");
            }
        }
    }

    if (this.headers !== null) {
        context.headers = context.headers || {};
        for (k in this.headers) {
            context.headers[k] = this.headers[k];
        }
    }

    return result.join();
};