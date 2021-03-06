Spludo Framework CHANGELOG
=======================

Official Site: <https://github.com/DracoBlue/spludo>

Spludo is copyright 2009-2014 by DracoBlue <http://dracoblue.net>

## 2.0.1 (2014/08/17)

* removed spludo.com from source
* put [USERGUIDE.md](USERGUIDE.md) and [CODINGSTANDARDS.md](CODINGSTANDARDS.md) into the repository

## 2.0.0 (2012/01/30)

* removed plugin system #4
* folder for code-templates is not needed anymore #6
* added proper underscore notation for generated services #7

## 1.1.0 (2011/11/20)

* added dependency to node >=0.4.0 && node < 0.5.0
* generator for monit+upstart configuration
* code generation for migrations extended with shortcut fields definition
* added support for application/json paylod
* generate *ByIds method for services
* added ApiServiceController to register a service as REST service
* context.request now holds the current req instance
* added inflection.js
* added node_modules for own vendor libraries
* replaced own testing system with vows (if you want to run the tests, please install vows!)
* spludo_directory variable is now set always when calling spludo-gen
* added bootstrap_manager.whenLoaded(callback) to get notified as
  soon as the app is ready.
* replaced self with that
* fixed core_dev_change_build_version on MACOSX
* added jshint instead of jslint
* added support for node_modules folder in project directory
* added Criteria for DatabaseDrivers
* added code generation for Migrations
* added SqliteDatabaseDriver
* added a Database Migration system
* added MysqlDatabaseDriver
* added code generation for Services
* added DatabaseManager and ServiceManager
* added Logging#addTracing (makes the this.trace(function_name) obsolete)
* Codegeneration loads the spludo application now (this enables the developer
  to generate code against the base of the application)
* Codegeneration #validateParameter receives the validated parameters now
* TestCases are now able to call .debug+.log and so on, because the execute
  method is applied to the TestSuite.

## 1.0.3 (2011/03/05)

* added dependency to node >=0.4.0
* putting plugin's lib folder to require path before bootstrap of the index.js files

## 1.0.2 (2010/12/14)

* bug #1: console and test application hang because of fs.watchFile in EjsView

## 1.0.1 (2010/09/26)

* group and chain are truely async now
* added "spludo-gen controller" (wizard to create a new controller)
* views can now be in sub folders
* added partial + partials in .ejs
* .ejs-Views recompile the view as soon as it is changed

## 1.0.0 (2010/09/20)

* Initial Release

