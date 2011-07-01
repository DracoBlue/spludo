/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2011 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var fs = require("fs");
var path = require("path");

DatabaseMigration = function(connection_name) {
    this.connection_name = connection_name;
    this.connection = database_manager.getDatabase(connection_name);
    this.migrations_folder = process.cwd() + '/dev/migrations/' + connection_name + '/';
    this.structure_dump_file_path = process.cwd() + '/dev/migrations/' + connection_name + '_structure.sql';
    this.fixtures_dump_file_path = process.cwd() + '/dev/migrations/' + connection_name + '_fixtures.sql';
};

DatabaseMigration.prototype.migrateAll = function() {
    var that = this;
    return function(cb) {
        fs.readdir(that.migrations_folder, function(error, raw_files) {
            if (error) {
                cb(true, "Migrations folder not found at: " + that.migrations_folder);
                return ;
            }
            that.connection.selectTableRows("executed_migrations")(function(error, migrated_version_rows) {
                migrated_versions = [];
                if (error) {
                    /*
                     * Ok, we don't have a executed_migrations table, yet!
                     */
                } else {
                    migrated_version_rows.forEach(function(row) {
                        migrated_versions.push(row.name);
                    });
                }

                var files = raw_files.slice();
                
                var not_yet_migrated_files = [];
                for (var i = 0; i < raw_files.length; i++) {
                    var raw_file_name = raw_files[i];
                    var timestamp = raw_file_name.substr(0, raw_file_name.indexOf('_'));
                    if (migrated_versions.indexOf(timestamp) !== -1) {
                        console.log('  > Already executed: ' + timestamp);
                    } else {
                        not_yet_migrated_files.push(that.migrations_folder + raw_file_name);
                    }
                }

                if (not_yet_migrated_files.length === 0) {
                    /*
                     * Nothing to do.
                     */
                    cb(false);
                    return ;
                }
                
                console.log(' Executing missing migrations:');
                that.connection.query("CREATE TABLE executed_migrations ("
                + "`name` VARCHAR( 255 ) NOT NULL,"
                + "UNIQUE ( `name` )"
                + ");")(function(error) {
                    that.migrateFiles(not_yet_migrated_files)(cb);
                });
            });
        });
    };
};

DatabaseMigration.prototype.downgradeAll = function() {
    var that = this;
    return function(cb) {
        fs.readdir(that.migrations_folder, function(error, raw_files) {
            if (error) {
                cb(true, "Migrations folder not found at: " + that.migrations_folder);
                return ;
            }
            that.connection.selectTableRows("executed_migrations")(function(error, migrated_version_rows) {
                migrated_versions = [];
                if (error) {
                    /*
                     * Ok, we don't have a executed_migrations table, yet!
                     */
                    cb(false);
                    return ;
                } else {
                    migrated_version_rows.forEach(function(row) {
                        migrated_versions.push(row.name);
                    });
                }

                var files = raw_files.slice();
                
                var already_migrated_files = [];
                for (var i = 0; i < raw_files.length; i++) {
                    var raw_file_name = raw_files[i];
                    var timestamp = raw_file_name.substr(0, raw_file_name.indexOf('_'));
                    if (migrated_versions.indexOf(timestamp) !== -1) {
                        console.log('  > Selecting for downgrade: ' + timestamp);
                        already_migrated_files.push(that.migrations_folder + raw_file_name);
                    }
                }
                
                already_migrated_files.reverse();

                if (already_migrated_files.length === 0) {
                    /*
                     * Nothing to do.
                     */
                    cb(false);
                    return ;
                }

                console.log(' Executing missing downgrades:');
                that.downgradeFiles(already_migrated_files)(cb);
            });
        });
    };
};

DatabaseMigration.prototype.downgradeFiles = function(files) {
    var that = this;
    return function(cb) {
        var migration_chain = [];
        files.forEach(function(file_path) {
            migration_chain.push(function(chain_cb) {
                var file_name_without_file_extension = file_path.split('.js')[0];
                var file_timestamp = path.basename(file_path, '.js').split('_')[0];
                console.log('  > Executing downgrade: ' + file_timestamp);
                require(file_name_without_file_extension).down(that.connection)(function(error, message) {
                    if (error) {
                        console.log('Failed downgrading: ' + file_timestamp, message);
                        cb(true, message);
                        return ;
                    }

                    that.connection.deleteTableRows("executed_migrations", "name = ?", [file_timestamp])(function(error, message) {
                        console.log('    ... done!');
                        chain_cb();
                    });
                });
            });
        });

        migration_chain.push(function() {
            cb(false);
        });

        chain.apply(GLOBAL, migration_chain);
    };
};

DatabaseMigration.prototype.migrateFiles = function(files) {
    var that = this;
    return function(cb) {
        var migration_chain = [];
        files.forEach(function(file_path) {
            migration_chain.push(function(chain_cb) {
                var file_name_without_file_extension = file_path.split('.js')[0];
                var file_timestamp = path.basename(file_path, '.js').split('_')[0];
                console.log('  > Executing migration: ' + file_timestamp);
                require(file_name_without_file_extension).up(that.connection)(function(error, message) {
                    if (error) {
                        console.log('Failed migrating: ' + file_timestamp, message);
                        cb(true, message);
                        return ;
                    }
                    var values = {
                        "name": file_timestamp
                    };
                    that.connection.createTableRow("executed_migrations", values)(function(error, message) {
                        console.log('    ... done!');
                        chain_cb();
                    });
                });
            });
        });

        migration_chain.push(function() {
            cb(false);
        });

        chain.apply(GLOBAL, migration_chain);
    };
};

DatabaseMigration.prototype.createStructureDump = function() {
    var that = this;
    return function(cb) {
        that.connection.dumpStructureToFile(that.structure_dump_file_path)(function(error) {
            cb();
        });
    };
};

DatabaseMigration.prototype.loadStructureDump = function() {
    var that = this;
    return function(cb) {
        that.connection.loadStructureFromFile(that.structure_dump_file_path)(function(error) {
            cb();
        });
    };
};

DatabaseMigration.prototype.removeStructureDump = function() {
    var that = this;
    return function(cb) {
        fs.unlink(that.structure_dump_file_path, function(error) {
            cb(error);
        });
    };
};

DatabaseMigration.prototype.createFixturesDump = function() {
    var that = this;
    return function(cb) {
        that.connection.dumpDatabaseToFile(that.fixtures_dump_file_path)(function(error) {
            cb();
        });
    };
};

DatabaseMigration.prototype.loadFixturesDump = function() {
    var that = this;
    return function(cb) {
        that.connection.loadDatabaseFromFile(that.fixtures_dump_file_path)(function(error) {
            cb();
        });
    };
};

DatabaseMigration.prototype.removeFixturesDump = function() {
    var that = this;
    return function(cb) {
        fs.unlink(that.fixtures_dump_file_path, function(error) {
            cb(error);
        });
    };
};