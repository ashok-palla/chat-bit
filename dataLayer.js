var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'us-cdbr-iron-east-05.cleardb.net',
    user: 'b6dc78df8aae06',
    password: '4a0ec4f7',
    database: 'heroku_f9ca64a925836b6',
    connectTimeout: 30000
});
module.exports.employees = function (emploeeId, callback) {
    connection.connect();
    connection.query("SELECT CONCAT(FirstName, CONCAT(' ', LastName)) as name  FROM employee WHERE ID =" + emploeeId, function (error, results, fields) {
        if (error) throw error;
        connection.end();
        callback(results[0].name);
    });
};