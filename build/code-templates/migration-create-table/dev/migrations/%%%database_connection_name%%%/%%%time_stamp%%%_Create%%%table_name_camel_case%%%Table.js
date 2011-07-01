module.exports.up = function(database_connection) {
    return function(cb) {
        database_connection.createTable('%%%table_name%%%', {
            '%%%id_key%%%': { 'type': 'INTEGER', 'primary': true, 'auto_increment': true },                                                     
            'name': { 'type': 'VARCHAR',  'type_size': 255 }, 
            'description': { 'type': 'TEXT', 'default': null }, 
            'create_date': { 'type': 'DATETIME' }
        })(function(error, message) {
            cb(error, message);
        });
    };
};
module.exports.down = function(database_connection) {
    return function(cb) {
        database_connection.dropTable('%%%table_name%%%')(function(error, message) {
            cb(error, message);
        });
    };
};