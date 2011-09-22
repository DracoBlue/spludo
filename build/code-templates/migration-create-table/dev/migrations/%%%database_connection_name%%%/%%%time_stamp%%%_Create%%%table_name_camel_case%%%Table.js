module.exports.up = function(database_connection) {
    return function(cb) {
        database_connection.createTable('%%%table_name%%%', {
            %%%fields_data%%%
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