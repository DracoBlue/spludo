# Spludo Userguide

## Create a Spludo Workspace

Create a new folder as spludo workspace. For instance:

    $ mkdir spludo-workspace
    $ cd spludo-workspace

You can download or clone the git repository of spludo.

No matter what way you used, you'll have the following directory structure:

    spludo-workspace/
        spludo/
            core/ - core classes
            build/ - necessary for build
            spludotests/ - the test application for spludo
            splud-gen - the generator application

### Installing Spludo with npm

You can easily install spludo with the following command:

    $ npm install spludo

### Download Spludo

Download the latest and greatest spludo from
[spludo's download page][spludo-download].

 [spludo-download]: https://github.com/DracoBlue/spludo/releases

### Spludo from the Git Repository

In your spludo-workspace directory just type:

    $ git clone git://github.com/DracoBlue/spludo.git

If you want to checkout a latest version of major versions branch (for
instance v1.0) you may use the following commands **instead**:

    $ git clone git://github.com/DracoBlue/spludo.git spludo-v1.0
    $ cd spludo-v1.0
    $ git checkout --track -b v1.0 origin/v1.0

This allows you to use multiple different versions of spludo on the same
node installation.

In this case you will have to use `spludo-v1.0/spludo-gen` instead of
`spludo-gen` in the application creation process. This will stick
your application to this specific spludo version.

## Create and Run a new Application

Now you can execute spludo-gen in your `spludo-workspace` folder.

Execute:

    $ spludo-gen new-project

Response should be something like this:

     Spludo-Generator - https://github.com/DracoBlue/spludo

       Template: new-project

    Name of the Project (e.g. myapp): myapp
    Spludo Directory [/home/jan/spludo/spludo/]:

       Working ...

    Directory created: /home/jan/spludo-workspace/myapp/
    Created file: /home/jan/spludo-workspace/myapp/run_console.js
    Created file: /home/jan/spludo-workspace/myapp/run_server.js
    Created folder: /home/jan/spludo-workspace/myapp/controllers
    Created file: /home/jan/spludo-workspace/myapp/config.js
    Created folder: /home/jan/spludo-workspace/myapp/static
    Created folder: /home/jan/spludo-workspace/myapp/lib
    Created file: /home/jan/spludo-workspace/myapp/lib/index.js
    Created file: /home/jan/spludo-workspace/myapp/build.xml
    Created folder: /home/jan/spludo-workspace/myapp/views

       Finished!

Your `spludo-workspace` folder looks like this now:

    spludo-workspace/
        spludo/
            core/ - core classes
            build/ - necessary for build
            spludotests/ - the test application for spludo
            splud-gen - the generator application
        myapp/ - your application!

In case you *did not installed* spludo to spludo-workspace/spludo, it will
look like this:

    spludo-workspace/
        myapp/ - your application!

Now enter the folder

    $ cd myapp

and run either in Server Mode:

    $ node run_server.js

and open your browser at <http://localhost:8000/>.

Or run in Console Mode:

    $ node run_console.js shell.hello
    Hello, back!

### Auto server restart on code change

There is also a special mode for the server, which relaunches the server as
soon as any of the .js files has changed.

To launch the server in this mode, do not use:

    $ node run_server.js

but use:

    $ bash run_dev_server.bash

instead.

This will restart the server as soon as anything changed. Remember, that
this will _not_ restart the server in case of a crash, to help you noticing
whenever a crash occurs.

## Understanding the Framework

This chapter is intended to give you a short overview about the framework and
what you might achieve with it. You should be able to judge, whether the
framework is the right choice for your job or not.

Spludo is a framework for Node.JS, thus uses an event loop in the background.
You need to understand what this means to benefit from this difference to other
frameworks and engines.

Spludo uses the *Continuable-Pattern* for most framework functions. That means
a function call is splitted in 2 function calls.

Instead of:

    var alice = getAlice(bob);
    // following code

You have to write:

    getAlice(bob)(function(alice) {
        // following code
    });

The important part is your `following code` will get executed as soon as the
value for `alice` is there. So long: the code does not block. No matter if it
takes 1ms or 10 seconds to retrieve the value. In the non-evented way, the
code blocks until getValue returns - and this is what is expensive when working
with I/O on file system or external systems.

Consider this in a non-Node.JS world:

    function home_controller() {
        /*
         * The next command may take multiple seconds to complete.
         * The server will be blocked, until the page is downloaded.
         */
        var response_text = download_page('http://google.de');
        return response_text;
    }


In Spludo you write this:

    new Controller('home.html', {
        "execute": function() {
            return function(cb) {
                var responseHandler = function(response_text) {
                    /* call cb as soon as we have the result from google */
                    cb(response_text);
                };

                http.get('http://google.de')(reponseHandler);
            }
        }
    });

The call to the system function `http.get` returns a function. You
read right: a function. This function is called with a single argument:
`responseHandler`. `responseHandler` will be called as soon as `http.get`
has the result.

When you are fimiliar with this style of programming, you won't add a new
variable for each handler (which you use only one time), but use an anonymous
function instead.

In Spludo you write this:

    new Controller('home.html', {
        "execute": function() {
            return function(cb) {
                http.get('http://google.de')(function(response_text) {
                    /* call cb as soon as we have the result from google */
                    cb(response_text);
                });
            }
        }
    });

This is the reasons, why each `Controller`s and `View`s `execute`-Method return
an function, which gets a callback as first parameter. To make super fast
non-blocking applications.

Since the framework offers also a console mode and is not bound to html in any
way, you can use the framework for any server or command line application.

## Controllers

Create a new folder `myapp/controllers`.

Create a new file and call it `myapp/controllers/main-controllers.js`.

And launch the application with

    new Controller('hello', {
        "execute": function(params, context) {
            return function(cb) {
                cb("My first test!");
            }
        }
    });

it will output now

    My first test!

If you have created a view and/or a layout, you can use
`context.view_name = 'ViewName'` and `context.layout_name = 'LayoutName'`
to wrap the response of the controller into the view and then wrap the views
response into the layout.

## Views

Create a new folder called `myapp/views`.

Create a file called `myapp/views/MyView.ejs` and paste the following content:

    The result of 2+5 = <%= (2+5) %>.

Now change your controller at `controllers/main-controllers.js` to the
following:

    new Controller("hello", {
        "execute": function(params, context) {
             return function(cb) {
                 context.view_name = "MyView";
                 cb();
             };
        }
    });

And launch the application with

    $ node run_console.js hello

it will output now

    The result of 2+5 = 7.

### JsView

You are also able to create a full Javascript class for a view.

Create a new file called `myapp/views/main-views.js`.

    new JsView('HelloView', function (params, context, inner) {
        return function(cb) {
            cb('Hello from JsView!');
        };
    });

Now change your controller at `controllers/main-controllers.js` to the
following:

    new Controller("hello", {
        "execute": function(params, context) {
             return function(cb) {
                 context.view_name = "HelloView";
                 cb();
             };
        }
    });

And launch the application with

    $ node run_console.js hello

it will output now

    Hello from JsView!

### EjsView

The EjsViews are HTML-Pages with embedded Javascript-tags.

To make a specific view called `MyView` known to the application you have to
put a file called `MyView.ejs` into `myapp/views` or the `views`-folder of a
plugin.

Now you are able to use `context.view_name = 'MyView'` in any controller.

There are two ways to define embedded Javascript.

- `<%= ... %>` can be used to evaluate Javascript code and echo it at this
  position.
- `<% ... %>` can be used to inject any Javascript code you want.

For instance executing this ejs-code:

    The result of 2+5 = <%= (2+5) %>.

would result in:

    The result of 2+5 = 7.

By using the powerful `<% ... %>` construct, even this is possible:

    <ul>
    <%
    for (var i=0; i<10; i++) {
    %>
        <li>This is the #<%= i %> line</li>
    <%
    }
    %>
    </ul>

#### Slot

You can also embed entire slots with the slot function

    <%
    slot('navigation')
    %>

This will include the *entire* output of the /navigation path, equivalent to a
direct call to the navigation url in your browser. The slot function also takes
a `context` as second and the `inner` as third parameter.

#### Partials

Additionally to the slot function, you can embed a view one or multiple times.
This views are called partials.

You may use them like this in the .ejs template.

    <%= partials('Section', [{'name': 'Easy'}, {'name': 'Difficult'}, {'name': 'Impossible'}]) %>

This will execute the views `views/partials/Section.ejs` (or .md or whatsever
view engine you use!) and set `params.name` for each of them.

If you want to include only a single element, use the keyword `partial` and no
array for the parameters.

    <%= partial('Section', {'name': 'Easy'}) %>

## Layout

A layout is just a special view.

That's why you can create a new file called `views/HtmlLayout.ejs`.

Paste the contents:

    <html>
      <body>
        <%= inner %>
      </body>
    </html>

Now change your controller at `controllers/main-controllers.js` to the
following:

    new Controller("hello", {
        "execute": function(params, context) {
             return function(cb) {
                 context.view_name = "MyView";
                 context.layout_name = "HtmlLayout";
                 cb();
             };
        }
    });

Relaunching the application with

    $ node run_console.js hello

will now output

    <html>
      <body>
        The result of 2+5 = 7.
      </body>
    </html>

## Models

If you want to make specific libraries or helpers available through nodejs's
require-system, you just have to create a `lib`-folder in your application or
plugin folder.

Before the application bootstraps these `lib`-folders will be added to
require.path and the `lib/index.js` will be executed, if available.

## Request-Handling

Whenever a request occurs (lets say: `http://example.org/hello/world`), the
static function `BaseApplication.executePath(path, context, inner)` will be
called.

In this case the `path` is the relative url for the application (for instance
`hello/world`).

### Matching Controller

As soon as a request is issued, the path is used to decide which controller
will be used.

Since controllers may be initialized with a `String` or a `RegExp` as `path`
the framework first looks up if a controller with a path represented as
`String` matches the given path exactly.

If that is not the case all `RegExp` paths will be tested whether they match
the given path. The first one, which matches the path defines the controller.


### Executing the Controller

Now `Controller#execute(params, context)` will be executed on the matching
controller.

`params` is an `Array` of capture groups from the controllers `RegExp` path
(in case the controller's path was a `RegExp`) or an `Array` with the `path`
as single element.

The controller is able to set `context.layout_name` and `context.view_name`
and returns the `inner` value for the view.


### Matching View

If `context.view_name` is set after the controllers execution, the view which
matches this name will be searched for.

Since every plugin and the application core can register new views within their
views-folder, it may be unclear which one to take. That's why there is a search
order:

1. same plugin
2. different plugin
3. core

If the search was not successful an error will be triggered.

If you accidently register the same view in multiple plugins, spludo will throw
a warning.

### Executing the View

Now `View#execute(params, context, inner)` will be executed on the matching
view. The `inner` is actually the controllers return value.

### Matching and Executing the Layout

Rendering the layout happens if `context.layout_name` is set after the
controllers and views execution (the view is optional).

Since layouts are views, the execution and rendering for layouts is the same as
for views.

## Validation

Whenever you receive insecure content, you may want to validate it first.

The framework has a handy class ready for this, it's called `Validation`.

This short example shows how to use it:

    values = {
       "register_username": "Ab"
    };

    var validation = new Validation();
    validation.add("register_email","email");
    validation.add("register_username","string", {
        "min": 3,
        "max": 12
    }, {
        "max": "The username is too long."
        "": "The username is invalid."
    });

    validation.execute(values)(function(errors) {
        if (errors.length) {
            /*
             * There have been errors
             */
        } else {
            /*
             * Everything fine! Do whatever you like with
             * validated elements at validation.getValidatedValues();
             */
        }
    });

## Configuration

There is a global `config` accessible from all over the application. In
`config.js` of your application, you can set all configuration parameters
depending on your environment.

The following example sets the log-level for the entire application to 7 and
uses MemoryStorage as SessionStorage.

    config.setValues({
        "logging": {
            "level": 7
        },
        "session": {
            "engine": "MemoryStorage",
        }
    });

## SessionManager

To use the session features of spludo, there is a `session_manager` global
available.

Whenever you want to create a session for the current user, you'll call:

    context.session_id = session_manager.createSession({username: username});

This will assign the `session_id` to the current context.

Removing a session works like this:

    session_manager.removeSession(context.session_id);
    context.session_id = null;

The framework will do the `Set-Cookie` handling for you, as soon as
`context.session_id` is changed or get's lost. That happens because the
default implementation is the `CookieSessionManager`.


If you want to update the session data, without changing the `session_id`,
you can use:

    var session_data = session_manager.getSession(context.session_id);
    session_data.is_admin = true;
    session_manager.setSession(context.session_id, session_data);

This will save the session data in the configured storage. Default storage is
MemoryStorage.

The session data is not saved on the clients computer. Instead the `session_id`
is set as cookie and read back.

If you want to inject a specific session by GET/POST parameter you have to
implement this in the controller. This should not be necessary in most cases.

## Custom Session Storage

You can configure a different storage (like for instance `MongodbStorage`) by
appending this to your `myapp/config.js`

    config.setValues({
        "session": {
            "engine": "MongodbStorage",
            "engine_options": {
                "host": "127.0.0.1",
                "port": "8089",
                "collection": "sessions",
                "database": "nodejs_test"
            }
        }
    });

## Custom Session Manager

If you want to implement a different way to handle retrieval and storage of the
session of the session from the request, you can define your own session
manager implementation.

You could for example create a `LdapSessionManager`, which validates the
current session always against the ldap server, before preceeding with the
request.

As soon as this class is implemented, you can do dependency injection (to use
this class instead) in your config.js by adding:

    config.setValues({
        "session_manager_engine": "LdapSessionManager"
    });

There is already a custom session manager for Facebook-Connect available, it's
called: [spludo-facebook-session].

  [spludo-facebook-session]: http://github.com/DracoBlue/spludo-facebook-session

## Services

This feature is part of spludo since 1.1.

Since you want to seperate the logic which talks to a database or external
system from any other logic you may see this task as a service.

This design pattern is widely accepted and core part of spludo's architecture.

All services are located at `lib/services/*Service.js` and follow the CommonJS
module system.

### Example Service

The smallest service looks like this (located at `lib/services/FooService.js`):

    extend(true, exports, Logging.prototype);
    exports.logging_prefix = 'FooService';

    exports.doReturnTwo = function() {
        return 2
    };

Usage is like that:

    var foo_service = service_manager.get('Foo');
    foo_service.doReturnTwo();

You may not be fimilar with this folder structure and the `exports` global
within modules, but this is how the commonjs module structure is. To make
your cold work great in whatever environment it's a good idea to keep the
services as a valid CommonJS module.

### Generating Services

Since working with databases shouldn't be much work, `spludo-gen` comes with
a task to generate a Service + DomainModels right out of the database
connection.

    $ spludo-gen service

       Template: service

    The database connection name [default]:
    The name for your service (e.g. User): User
    The database table name (e.g. users): users
    The table field for the id [id]:

    ...

       Finished!

       User your new service now with:

          var user_service = service_manager.get('User');
          user_service.getUserById(function(user) {
              console.log(user);
          }, 1234);

Now you can use this service. The generated classes is a file calles
`lib/services/UserService.js` which holds to classes.

The `UserService` is returned by `service_manager.get('User')` and
has handy methods to `getUserById(id)`, `deleteUser(user)`,
`updateUser(user, values)`.

It also contains a `User` class, which is the type of element's which
will be returned by `getUserById` and have to be inserted as parameter to
`deleteUser` and so on. The generated domain model has some methods like
`getName`+`getId` (depending on your database structure).

The idea behind getters at this point is, that you can overwrite the
way the function returns the value, which wouldn't be possible if the
service would only return a raw json object.

### REST Services

This feature is part of spludo since 1.1.

If you want to make one of your services accessible as a REST Service, you
don't have to write the mapping for each of your functions to HTTP-Methods
on your own.

Let's assume you have a `lib/services/WebApiService.js`.

Simple put this into your `myapp/main-controllers.js`:

    new ApiServiceController("api", service_manager.get('WebApi'));

This will register all methods on it's own with the following mapping:

* `GET /api/users/` to `#getUsers(cb, params, context)`
* `POST /api/users/` to `#postUser(cb, params, context)`
* `DELETE /api/users/123` to `#deleteUser(cb, 123, context)`
* `PUT /api/users/123` to `#putUser(cb, 123, params, context)`
* `GET /api/users/123` to `#getUser(cb, 123, params, context)`

The functions within the service have to look like that:

    WebApiService.prototype.putUser = function(cb, user_id, params, context) {
        /*
         * Your logic ...
         */
        if (user_not_found) {
            cb(404, 'Cannot find that user');
        } else {
            cb(200, {
                'id': user_id,
                'name': 'Hans'
            });
        }
    }

The callback always takes a first parameter which is the http status code. So
we return 200 with a valid object, if it worked. But we return 404 if the user
was not found.

The result for the caller will look like that (with http code 404):

    {"status":false,"error":"Cannot find that user"}

and in case of success like that (with http code 200):

    {"status":true,"data":{"id":2,"name":"Hans"}}

As you can see the verb is used as prefix (GET, POST, DELETE) and depeding on
the case if you try to call the collection it calls the pluralized version
(`methodUsers`) or the singular version (`methodUser`).

To achieve that spludo uses the inflection.js library. If you want to override
the mapping use it like that:

    new ApiServiceController("api", service_manager.get('WebApi'), {
        'singular': {
            'mice': 'mouse',
            'men': 'man'
        }
    });

This will still keep the Api like `api/mice` but the methods are:

* `GET /api/mice/` to `getMice(cb, params, context)`
* `POST /api/mice/` to `postMouse(cb, params, context)`

It's also possible to override the method (in case you are in a context
when you have to send *every* request with `POST`). Use the query parameter
`_method`.

This `POST /api/users/123?_method=delete` has the same effect like
 `DELETE /api/users/123`, it calls: `#deleteUser(cb, 123, context)`.

## Databases

Even though spludo does not force you to use any specific database engine or
connection library, you'll get database migrations and service layer generation
with no extra work.

All you need to do is to configure a database connection with the proper
database driver.

### Database Connections

This feature is part of spludo since 1.1.

To configure a database connection within spludo, you need to add such block to
your `local.config.js`:

    config.setPathValue(["database_connections", "default"], {
        "driver_name": "MysqlDatabaseDriver",
        "driver_options": {
            "user": "myusername",
            "password": "thisisnopassword",
            "database": "mydatabase",
            "host": "localhost",
            "port": 3306
        }
    });

All possible `driver_options` depend on the database driver you use, see the
[Api Documentation for MysqlDatabaseDriver] for reference of the mysql database
driver.

Now you are able to access the database (e.g. "default") by using the following
call:

    var database = database_manager.getDatabase('default');
    database.selectTableRows('users', 'id = ?', [2])(function(error, results) {
        console.log('Fetched user with id 2!', results[0]);
    });

If you want to work with the databases please take a look at spludo's service
architecture and make use of the `spludo-gen service` task!

### Migrations

This feature is part of spludo since 1.1.

Spludo also features a database migration system. The commands are inspired by
ruby on rails. All commands will run on all configured database connection.

You may issue any of the migration logic, by calling ant with the correct
target

    $ ant db:migrate

The available targets are:

    db:bootstrap        Load the fixtures and execute pending migrations.
    db:fixtures:dump    Dump the current database as fixtures.
    db:fixtures:load    Load the fixtures into the database structure.
    db:fixtures:reset   Remove the current database fixtures dump.
    db:migrate          Execute all pending migrations and create a structure dump.
    db:rollback         Rollback all migrations.
    db:structure:dump   Dump the current database structure to a structure dump.
    db:structure:load   Load the current database structure from a structure dump.
    db:structure:reset  Remove the current database structure dump.

If you want to create a new migration, you need to use the `spludo-gen` tool.

    $ spludo-gen migration-create-table
      Create a migration, which creates a database table.

    $ spludo-gen migration-add-column
      Create a migration, which adds a column to a database table.

After the migration is generated, it's located at `dev/migrations/CONNECTION_NAME/TIMESTAMP_Name.js`.
The identifier for the migrations is the timestamp, which decreases the
possibility that two co workers create a migration with the same identifier.

Migrations are database connection name specific. Thus you can migrate multiple
data sources for your application idenpenden from each other.

The `db:structure:*` targets are used for setting up an initial database
structure or storing the current one. This structure file is located at `dev/migrations/CONNECTION_NAME_structure.sql`.
If no migrations have been executed on the database, yet, the `db:migrate` target will call `db:structure:load`
first and afterwards migrate. This will avoid heavy migration work, if you just want to setup a working copy from
scratch.

The  `db:fixtures:*` targets are used for loading a fixtures dump or storing
the current database as fixtures. This fixtures file is located at `dev/migrations/CONNECTION_NAME_fixtures.sql`.
You should use

    $ ant db:bootstrap

on a fresh working copy. This target executes `db:fixtures:load` and afterwards
`db:migrate`. This is also helpful for tests!

### DatabaseDriver

This feature is part of spludo since 1.1.

A database driver is just a class which implements the following interface. See
[MysqlDatabaseDriver] as reference.

One could use a database driver like this:

    database.query(sql, parameters_array)(function(error, results) {
        // error is true or false
        // results depends on the query
    });
    database.createTableRow(table_name, values)(function(error, last_insert_id) {
        // error is true or false
        // last_insert_id is the id of the last itemamount of removed rows
    });
    database.selectTableRows(table_name, where_condition, where_parameters_array)(function(error, results) {
        // error is true or false
        // results is an array of rows
    });
    database.updateTableRows(table_name, values, where_condition, where_parameters_array)(function(error, affected_rows_count) {
        // error is true or false
        // affected_rows_count is the amount of updated rows
    });
    database.deleteTableRows(table_name, where_condition, where_parameters_array)(function(error, affected_rows_count) {
        // error is true or false
        // affected_rows_count is the amount of removed rows
    });

For DatabaseMigration-purpose there are also some methods like
`database#createTable`. Please have a look at the [Api Documentation for MysqlDatabaseDriver]
for reference.

  [MysqlDatabaseDriver]: https://github.com/DracoBlue/spludo/blob/master/core/database/MysqlDatabaseDriver.js

## Storage

A storage is just a class which implements the following interface.

One could use a storage like this:

    storage.get(key)(function(value) {
        // value is a value or undefined
    });
    storage.has(key)(function(has_value) {
        // has_value is a boolean
    });
    storage.remove(key)(function() {
        // executed as soon as the removal is finished
    });
    storage.set(key, value)(function() {
        // executed as soon as setting the value is finished
    });

There are already some storages implemented. There is a *MemoryStorage*, which
is used as default configuration for the session manager. The [MongodbStorage],
[RedisStorage] and [MysqlStorage] is ready, too.

  [MongodbStorage]: http://github.com/DracoBlue/spludo-plugins/tree/master/mongodb-storage/
  [MysqlStorage]: http://github.com/DracoBlue/spludo-plugins/tree/master/mysql-storage/
  [RedisStorage]: http://github.com/DracoBlue/spludo-plugins/tree/master/redis-storage/

## Routing

If you want to define a new route, you use a [sinatra][sinatra-website]-like
way.

 [sinatra-website]: http://www.sinatrarb.com/
                    (Sinatra is a DSL for quickly creating web applications in Ruby with minimal effort.)

But instead of calling a global get/post-function, you construct a new object,
which implements the `Controller` interface and give it the `path` (can be
a `String` or a `RegExp`) as first argument.

For example:

    new Controller("ping/hello/world", {
        "execute": function(params, context) {
            return function(cb) {
                cb("pong!");
            }
        }
    });

This gives you the power to extend the controller and reuse it in your
application to keep your code [DRY][dry-article].

  [dry-article]: http://en.wikipedia.org/wiki/Don%27t_repeat_yourself
                 (Don't repeat yourself)

This is a sample implementation for a `SyncController` and its usage:

    // Definition of the SyncController:
    SyncController = function(path, sync_function) {
        var options = [
            path, {
                execute: function() {
                    var args = arguments;
                    return function(cb) {
                        cb(sync_function.apply(this, args));
                    };
               }
            }
        ];
        Controller.prototype.constructor.apply(this, options);
    };
    extend(true, SyncController.prototype, Controller.prototype);

    // Usage:
    new SyncController("ping/hello/world", function(params, context) {
        return "pong!";
    });

As you can see, the `SyncController` is a controller, which does not need the
evented way and wants to return the value.

There are plenty other use cases for this. For instance an `ApiController`,
which receives `SOAP` or just returns a value which get's wrapped into a
`SOAP`-Reply or a `JSON-String`.

You are also able to use `RegExp` objects as path.

    new SyncController(/^user_comments/\d+/\d+$/, function(params, context) {
        var user_id = params[1];
        var page = params[2];
        return "Hello user #" + user_id + ". We have no page " + page;
    });

The `SyncController` is already part of Spludo. And it's implemented exactly this
way.

## Redirects

If you want to redirect to any url in your application, you may use the static
`ContextToolkit.applyRedirect` function.

This can be done within controller or view, even though you are encouraged to
use it *only* in the controller.

    ContextToolkit.applyRedirect(context, "/hello");

After the execution of the path is finished, the page will redirect to `hello`.

Mind the preceeding slash. It's necessary because this function just sets the
HTML header `Location`. You may even use absolute url's here:

    ContextToolkit.applyRedirect(context, "http://example.org");

## Static Files

If your application is also intended to serve static files (like images, css
or the `favicon.ico`), the static file dispatching for spludo is right for you.

Create a new folder `myapp/static`.

Every file you put into the static folder will be matched as route and
delivered prefixed with `static/`. Thus if you put a `screen.css` with the
following contents into the static folder, you'll be able to access it at the
path `myapp/static/screen.css`.

    body {
        background-color:#230585;
    }


## Tests (vows)

To be able to run the tests, please install vows[vows-website].

You can easily write your own tests. Create a folder called `myapp/test` and
create a file called `myapp/test/math-test.js`.

    require('./../../core');

    var vows = require("vows");
    var assert = require("assert");

    vows.describe("math").addBatch({

        "Math for beginners": {

            'topic': function() {
                bootstrap_manager.whenLoaded(this.callback);
            },

            onePlusTwo: function() {
                assert.equal(1 + 2, 3);
                assert.equal(2 + 1, 3);
            },

            thisWillFail: function() {
                assert.equal(1, 2);
            }
        }

    }).export(module);

If you run now:

    $ ant test

your tests will get executed. One failed and another one successful.

You can also generate a [junit][junit-website]-like xml file for your tests, be calling:

   [junit-website]: http://junit.org
                    (Java Testing Framework)
   [vows-website]:  http://vowsjs.org
                    (Javascript Testing Framework)

    $ ant test-xml

The result may be found at `myapp/build/test_results.xml` and can be integrated
into a continuous integration environment (like hudson).

If you want to test if spludo-core works as expected, you have to use the ant
build tool and type:

    $ ant core-test

This will run the spludo core tests and output the results. Everything should
work fine!

## Code-Sniffer (jshint)

Checking whether your code style is valid can be done by using the task

    $ ant lint

This ant task runs the tool `jhint` (assumes jshint is in the shell path) and
outputs the result. If jshint is not yet installed, you can install it by using
npm:

    $ npm install jshint -g

You can also generate Checkstyle-like xml for a jshint report, by calling:

    $ ant lint-xml

The result may be found at `myapp/build/jslint_report.xml` and can be integrated
into a continuous integration environment (like hudson).

## Buildscript (ant)

All the build tasks of spludo are called by using [ant][ant-website]. You can add own tasks by
editing your applications `myapp/build.xml`.

  [ant-website]: http://ant.apache.org/
                 (Java Build Tool)

You may list all available targets by using:

    $ ant -p

Output:

    Buildfile: build.xml

            This is the DocsForIt application built with spludo.

    Main targets:

     clean               Clean the build directory
     core-api            Generate the spludo core api
     core-clean          Clean the spludo core build folder
     core-lint           Execute jshint on the spludo core
     core-lint-xml       Execute jshint on the spludo core (with xml output)
     core-test           Execute the core tests
     core-test-xml       Execute the core tests (with xml output)
     db:bootstrap        Load the fixtures and execute pending migrations.
     db:fixtures:dump    Dump the current database as fixtures.
     db:fixtures:load    Load the fixtures into the database structure.
     db:fixtures:reset   Remove the current database fixtures dump.
     db:migrate          Execute all pending migrations and create a structure dump.
     db:rollback         Rollback all migrations.
     db:structure:dump   Dump the current database structure to a structure dump.
     db:structure:load   Load the current database structure from a structure dump.
     db:structure:reset  Remove the current database structure dump.
     lint                Execute jshint
     test                Execute the tests
     test-xml            Execute the tests (with xml output)

Even though ant is a powerful tool, some tasks (like converting the text output
from jsl into a checkstyle.xml) are pretty difficult to achieve. That's why
the framework has a folder called `build` which contains a helper script called
`convert_jslint_to_checkstyle.js`.

Since this script is written in Javascript it's easy for Javascript developers
to extend/maintain it. You should think about such strategy for your own
project, too - as soon as you reach the maintainable borders of ant.

## Continuous Integration (hudson-ci)

There are some build steps necessary, which should be used depending on the
amount of features you want to use.

- Generate api docs (jsdoc toolkit)
- Run Tests (vows)
- Run Checkstyle (jshint)

An *Invoke Ant* for the general setup, cleaning the build folder is necessary
to avoid unused files.

    clean

### Run Tests

An *Invoke Ant* for *Testing* is necessary, because we want to run the tests
at all.

    test-xml

The *Post-build Action* "Publish JUnit test result report" must be
activated and given `myapp/build/test_results.xml` as `Test report XMLs`.

### Generate Api-Docs

Generation of the api docs needs [JsDoc Toolkit][jsdoc toolkit] installed
(unzipped at any place).

  [jsdoc toolkit]: http://code.google.com/p/jsdoc-toolkit/
                   (A documentation generator for JavaScript)

This *BuildStep* is necessary, because you'll need to create a
`build.properties` file, which fits the jsdoc-toolkit path of your
installation.

    cd $WORKSPACE/myapp/
    echo "" > build.properties
    echo "jsdoctoolkit.directory=/home/spludo/jsdoc_toolkit-2.3.2/jsdoc-toolkit/" >> build.properties

An *Invoke Ant* for *Api-Docs* is necessary, because we need to generate the
api docs at one point.

    api

The *Post-build Action* "Publish Javadoc" must be activated and given
`myapp/build/api` as `Javadoc directory`.

### Run Checkstyle

*Checkstyle* can be used to check whether your Javascript code is valid by
jslint.

An *Invoke Ant* for *Checkstyle* is necessary, because we want to run the
validation

    lint-xml

The *Post-build Action* "Publish Checkstyle analysis results" must be activated
and given `myapp/build/jslint_report.xml` as `Publish Checkstyle analysis
results`.

## Bootstrap Manager

Spludo also features a Bootstrap-Manager. A component, which takes some seconds
to get ready for the first request, may register itself like this:

    var bootstrap_token = bootstrap_manager.createMandatoryElement(
        'Pre caching of some elements.'
    );

and free the token, as soon as it's done:

    bootstrap_manager.finishMandatoryElement(bootstrap_token);

This works of course evented. The `ConsoleApplication`, `ServerApplication` or
`TestApplication` waits for the `BoostrapManager` to emit the `"end"`-event, before
it starts serving pages or running tests.

### whenReady

Since you can't (and do not want to) set the order in which the plugins will be
loaded, you will run into a problem if you need a specific order.

The BootstrapManager has a handy method called `whenReady(parts, callback)`. The
`parts` is an array of mandatory element names and the callback will be executed
as soon as those are ready.

In case they have been already ready, the callback will be run without any
interruption.

The following example is used with the sitemap plugin, to add urls to the
sitemap after the plugin `sitemap` is ready. It fits best into the
`lib/index.js` of the application.

    bootstrap_manager.whenReady(["plugin.sitemap"], function() {
        sitemap_manager.addUrl('');
        sitemap_manager.addUrl('downloads/');
        sitemap_manager.addUrl('plugins/');
        sitemap_manager.addUrl('license/');
    });

### whenLoaded

This feature is part of spludo since 1.1.

If you want to execute something when the entire application is loaded, you can
register on that event.

    bootstrap_manager.whenLoaded(function() {
        console.log('I am there!');
    });

This function is used internally to run tests, when everything is set up. But
could be used in your own workflow.