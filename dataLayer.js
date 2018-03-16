var mysql = require('mysql');
var Joi = require('joi');
module.exports.employees = function (emploeeId, callback) {
    const schema = { emploeeId: Joi.number().min(21100).max(30000).required() };
    const value = { emploeeId: emploeeId };
    Joi.validate(value, schema, (err, value) => {
        if (err) callback('buddy, please check employee identification.');
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
            callback(results.length > 0 ? results[0].name : ('no employee exists on ' + emploeeId));
        });
     });
};
