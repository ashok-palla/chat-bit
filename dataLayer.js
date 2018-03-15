var mysql = require('mysql');
module.exports.employees = function (emploeeId, callback) {
    var connection = mysql.createConnection({
        host: 'us-cdbr-iron-east-05.cleardb.net',
        user: 'b6dc78df8aae06',
        password: '4a0ec4f7',
        database: 'heroku_f9ca64a925836b6',
        connectTimeout: 30000
    });
    connection.connect();
    connection.query("SELECT FirstName as name  FROM employee WHERE ID =" + emploeeId, function (error, results, fields) {
        if (error) throw error;
        connection.end();
        console.log(results);
        callback(results[0].name ?results[0].name:'no employee')
                 
    });
};
