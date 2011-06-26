/*
 * This file is part of the Spludo Framework.
 * Copyright (c) 2009-2011 DracoBlue, http://dracoblue.net/
 *
 * Licensed under the terms of MIT License. For the full copyright and license
 * information, please see the LICENSE file in the root folder.
 */

var forEachDatabaseMigration = function(sub_cb) {
    return function(cb) {
        var migration_chain = []; 
        var database_connection_configs = config.get('database_connections');
        for (var key in database_connection_configs) {
            (function(database_name, database_config) {
                migration_chain.push(function(chain_cb) {
                    var migration = new DatabaseMigration(database_name);
                    sub_cb(database_name, migration, chain_cb);
                })
            })(key, database_connection_configs[key]);
        };
    
        migration_chain.push(function(chain_cb) {
            cb();
        });
    
        chain.apply(GLOBAL, migration_chain);
    };
};

new Controller("db:migrate", {
    "execute": function(params, context) {
        return forEachDatabaseMigration(function(database_name, migration, chain_cb) {
            console.log('Migrating: ' + database_name);
            
            var doMigrateAll = function() {
                migration.migrateAll()(function() {
                    chain_cb();
                });
            };
            
            migration.connection.selectTableRows("executed_migrations")(function(error, migrated_version_rows) {
                if (error) {
                    /*
                     * We have no structure, yet:
                     */
                    console.log('  > Not setup yet, loading structure first.');
                    migration.loadStructureDump()(function() {
                        console.log('    ... done!');
                        doMigrateAll();
                    });
                } else {
                    /*
                     * Structure is there, let's just migrate it!
                     */
                    doMigrateAll();
                }
            });
        });
    }
});

new Controller("db:rollback", {
    "execute": function(params, context) {
        return forEachDatabaseMigration(function(database_name, migration, chain_cb) {
            console.log('Downgrading: ' + database_name);
            migration.downgradeAll()(function() {
                chain_cb();
            });
        });
    }
});

new Controller("db:structure:dump", {
    "execute": function(params, context) {
        return forEachDatabaseMigration(function(database_name, migration, chain_cb) {
            console.log('Dumping: ' + database_name);
            migration.createStructureDump()(function() {
                chain_cb();
            });
        });
    }
});

new Controller("db:structure:load", {
    "execute": function(params, context) {
        return forEachDatabaseMigration(function(database_name, migration, chain_cb) {
            console.log('Loading: ' + database_name);
            migration.loadStructureDump()(function() {
                chain_cb();
            });
        });
    }
});

new Controller("db:fixtures:dump", {
    "execute": function(params, context) {
        return forEachDatabaseMigration(function(database_name, migration, chain_cb) {
            console.log('Dumping: ' + database_name);
            migration.createFixturesDump()(function() {
                chain_cb();
            });
        });
    }
});

new Controller("db:fixtures:load", {
    "execute": function(params, context) {
        return forEachDatabaseMigration(function(database_name, migration, chain_cb) {
            console.log('Loading: ' + database_name);
            migration.loadFixturesDump()(function() {
                chain_cb();
            });
        });
    }
});