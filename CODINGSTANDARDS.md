# Spludo Codingstandards

## Why Standards?

Everyone has his own programming style. Influenced by thousands of lines of
code read and written in the past. When providing a library or framework it's
important that the code follows a constant style, to make reading,
understanding and extending the code easy.

## Block-Indention & File-Encoding

The files are indented by 4 spaces. The file encoding is utf8. Line endings are \n.

## Names: Functions, Classes and Variables

All classes are camelcase and start with an uppercase letter.

    MyClass, ThisClass

All variables are always lowercase and words are seperated by a `_`. This is also
valid for parameters!

    user_id, first_name

All member functions are camelcase and start with a lowercase letter.

    MyClass.getUserName

## Braces & Indention

Braces are always on current line. This example code should express how those are
handled.

    var response_handler = function(data, seperator) {
        var response = [];

        var data_length = data.length;

        for (var i = 0; i < data_length; i++) {
            response.push(seperator + data[i] + seperator);
        }

        /*
         * Example for {} and [] initializers.
         */
        var example_variable = {
            "key": [
                1, 2, 3
            ],
            "key_two": {
                "key_two_two": "value"
            }
        };

        return response.join("");
    }

## Continuous-Style

Whenever a function in the spludo core is used async, it returns a function which
takes just one argument as parameter. Why this works this way, can be read in the
[understanding the framework] chapter in the user guide.

  [understanding the framework]: USERGUIDE.md

    // definition of getAlice function
    function getAlice(bob) {
        return function(cb) {
            cb(bob.toUpperCase());
        };
    }

    // usage of getAlice function
    getAlice(bob)(function(alice) {
        // following code
    });

## Extending objects

The `BaseApplication` is a good example how one can extend prototypes.

    /**
     * @class Is a base application (should be extended).
     *
     * @extends Options
     * @extends Logging
     *
     * @since 0.1
     * @author DracoBlue
     */
    BaseApplication = function(options) {
        this.setOptions(options);
        if (typeof this.run !== "function") {
            throw new Error("Implement the .run method!");
        }
    };

    extend(true, BaseApplication.prototype, Options.prototype, Logging.prototype);

    BaseApplication.prototype.logging_prefix = 'BaseApplication';

In this case the BaseApplication is extended by Options and Logging.

A new function for the prototype may be defined in this way:

    BaseApplication.prototype.run = function() {
        throw new Error("run method not implemented!");
    };


## Comments-Style

You may use:

    /**
     * Entity Comment
     */
    function getUserNameById(user_id)

to comment any entity in the core. Documentation of obvious things is *highly
discouraged*. This is why, there is no explanation comment for what `user_id`
is or what the return value is. It's obvious that the return value is a `String`
and the `user_id` is an id!

You may use:

    /*
     * Comment
     */

to explain decisions with those comments.

You may **not** use:

    //

they are reserved for temporary comments while developing and `//` code is
expected to be committed by accident.

## Header

This header should be the first lines of each `.js` file:

    /*
     * This file is part of the Spludo Framework.
     * Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
     *
     * Licensed under the terms of MIT License. For the full copyright and license
     * information, please see the LICENSE file in the root folder.
     */

In case of a `.xml` file, the header looks like this and should be injected right after
the first node.

    <!-- This file is part of the Spludo Framework. -->
    <!-- Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/ -->
    <!-- -->
    <!-- Licensed under the terms of MIT License. For the full copyright and license -->
    <!-- information, please see the LICENSE file in the root folder. -->

If `#` is used as comment character you may also use this style:

    #
    # This file is part of the Spludo Framework.
    # Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
    #
    # Licensed under the terms of MIT License. For the full copyright and license
    # information, please see the LICENSE file in the root folder.
    #

## Forbidden Functions/Statements

You should not use the with, switch or eval statement. The reasons may be found
in the [javascript the good parts] book by Douglas Crockford.

  [javascript the good parts]: http://oreilly.com/catalog/9780596517748

Usually there is a better implementation possible.