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
    Joi.validate(emploeeId, Joi.number().min(21100).max(30000).required(), (err, value) => {
        if (err) callback('buddy, \nplease check employee identification.');
        var connection = mysql.createConnection(credentials);
        connection.connect();
        connection.query("SELECT * FROM employee E JOIN designation D ON D.ID = E.DesignationID WHERE E.ID =" + emploeeId, function (error, results, fields) {
            connection.end();
            if (error) callback(error);
            callback(results);
        });
    });
};
module.exports.employeeName = function (emploeeName, callback) {
    var connection = mysql.createConnection(credentials);
    connection.connect();
    connection.query("SELECT *, E.ID as empId FROM employee E JOIN designation D ON D.ID = E.DesignationID WHERE E.FirstName like '%" + emploeeName + "%' or E.LastName like '%" + emploeeName + "%'", function (error, results, fields) {
        connection.end();
        if (error) callback(error);
        callback(JSON.parse(JSON.stringify(results)));
    });
};
module.exports.employeeName_lastName = function (emploeeName, lastName, callback) {
    var connection = mysql.createConnection(credentials);
    connection.connect();
    connection.query("SELECT *  FROM employee E JOIN designation D ON D.ID = E.DesignationID WHERE E.FirstName like '%" + emploeeName + "%' and E.LastName like '%" + lastName + "%'", function (error, results, fields) {
        connection.end();
        if (error) callback('buddy, \nplease check name.');
        callback(JSON.parse(JSON.stringify(results)));
    });
};
module.exports.emailCheck = function (email, callback) {
    var connection = mysql.createConnection(credentials);
    connection.connect();
    connection.query("SELECT * FROM EMPLOYEE where EmailID = '" + email + "'", function (error, results, fields) {
        connection.end();
        if (error) callback('buddy, \nplease check email.');
        callback(JSON.parse(JSON.stringify(results)));
    });
};
module.exports.employeeIdCheck = function (employeeId, callback) {
    Joi.validate(employeeId, Joi.number().integer().min(21100).max(30000).required(), function (err, value) {
        if (err) callback('buddy, \nplease check employee identification.');
        var connection = mysql.createConnection(credentials);
        connection.connect();
        connection.query("SELECT * FROM EMPLOYEE where ID = " + employeeId, function (error, results, fields) {
            connection.end();
            if (error) callback('buddy, \nplease check employee identification.');
            console.log(employeeId);
            callback(JSON.parse(JSON.stringify(results)));
        });
    });
};

