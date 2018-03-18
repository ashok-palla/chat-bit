var mysql = require('mysql');
var Joi = require('joi');
const credentials = {
    host: 'us-cdbr-iron-east-05.cleardb.net',
    user: 'b6dc78df8aae06',
    password: '4a0ec4f7',
    database: 'heroku_f9ca64a925836b6',
    connectTimeout: 30000
};
module.exports.employeeId = function (emploeeId, callback) {
    if (emploeeId >= 21100 && emploeeId <= 30000) {
        const schema = { emploeeId: Joi.number().min(21100).max(30000).required() };
        const value = { emploeeId: emploeeId };
        Joi.validate(value, schema, (err, value) => {
            if (err) callback('buddy, please check employee identification.');
            var connection = mysql.createConnection(credentials);
            connection.connect();
            connection.query("SELECT FirstName, LastName  FROM employee WHERE ID =" + emploeeId, function (error, results, fields) {
                if (error) throw error;
                connection.end();
                callback(results);
            });
        });
    }
    else {
        callback('buddy, please check employee identification.');
    }
};
module.exports.employeeName = function (emploeeName, callback) {
    var connection = mysql.createConnection(credentials);
    connection.connect();
    connection.query("SELECT *  FROM employee E JOIN designation D ON D.ID = E.DesignationID WHERE E.FirstName like '%" + emploeeName + "%' or E.LastName like '%" + emploeeName + "%'", function (error, results, fields) {
        if (error) console.log(error);
        connection.end();
        callback(JSON.parse(JSON.stringify(results)));
    });
};
module.exports.employeeName_lastName = function (emploeeName, lastName, callback) {
    var connection = mysql.createConnection(credentials);
    connection.connect();
    connection.query("SELECT *  FROM employee E JOIN designation D ON D.ID = E.DesignationID WHERE E.FirstName like '%" + emploeeName + "%' and E.LastName like '%" + lastName + "%'", function (error, results, fields) {
        if (error) callback('buddy, please check name.');
        connection.end();
        callback(JSON.parse(JSON.stringify(results)));
    });
};
module.exports.emailCheck = function (email, callback) {
    var connection = mysql.createConnection(credentials);
    connection.connect();
    connection.query("SELECT * FROM EMPLOYEE where EmailID = '" + email + "'", function (error, results, fields) {
        if (error) callback('buddy, please check email.');
        connection.end();
        callback(JSON.parse(JSON.stringify(results)));
    });
};
module.exports.employeeIdCheck = function (employeeId, callback) {
    Joi.validate(employeeId, Joi.number().integer().min(21100).max(30000).required(), function (err, value) {
        if (err) callback('buddy, please check employee identification.');
        var connection = mysql.createConnection(credentials);
        connection.connect();
        connection.query("SELECT * FROM EMPLOYEE where ID = " + employeeId, function (error, results, fields) {
            if (error) callback('buddy, please check employee identification.');
            connection.end();
            callback(JSON.parse(JSON.stringify(results)));
        });
    });
};

