var mysql = require('mysql');
var connection = mysql.createConnection({
    host: '35.192.143.8',
    user: 'ashok',
    password: 'ashok',
    database: 'employee',
    connectTimeout: 30000
});
module.exports.employees = function (emploeeId, callback) {
    connection.connect();
    connection.query("SELECT CONCAT(FirstName, CONCAT(' ', LastName)) as name  FROM employee WHERE ID =" + emploeeId, function (error, results, fields) {
        if (error) throw error;
        callback(results[0].name);
    });
    connection.end();
};