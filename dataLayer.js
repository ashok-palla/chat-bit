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
    connection.query("SELECT *, E.ID as empId FROM employee E JOIN designation D ON D.ID = E.DesignationID WHERE E.FirstName like '%" + emploeeName + "%' and E.LastName like '%" + lastName + "%'", function (error, results, fields) {
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
    const validate = Joi.validate(employeeId, Joi.number().integer().min(21100).max(30000).required());
    if (validate.error === null) {
        var connection = mysql.createConnection(credentials);
        connection.connect();
        connection.query("SELECT * FROM EMPLOYEE where ID = " + employeeId, function (error, results, fields) {
            connection.end();
            if (error) callback('buddy, \nplease check employee identification.');
            callback(JSON.parse(JSON.stringify(results)));
        });
    }
    else {
        callback('buddy, \nplease check employee identification.');
    }
};
module.exports.employeeSearch = function (params, callback) {
    const schema = Joi.object().keys({
        employee_search_criteria: Joi.string().min(1).required(),
        firstName: Joi.string().min(1).required(),
        lastName: Joi.string().min(1).required()
    });
    const value = {
        employee_search_criteria: params.employee_search_criteria,
        firstName: params.firstName,
        lastName: params.lastName
    };
    const validate = Joi.validate(value, schema);
    if (validate.error === null) {
        if (params.employee_search_criteria === 'manager') {
            var connection = mysql.createConnection(credentials);
            connection.connect();
            connection.query("SELECT E.*, CONCAT(EE.FirstName, CONCAT(' ', EE.LastName)) as managerName FROM employee E JOIN designation D ON D.ID = E.DesignationID JOIN EMPLOYEE EE ON EE.ID = E.Immediate_Reporting_Manager_ID WHERE E.FirstName like '%" + params.firstName + "%' or E.LastName like '%" + params.lastName + "%'", function (error, results, fields) {
                connection.end();
                if (error) callback('buddy, \nplease check employee identification.');
                var RResult = JSON.parse(JSON.stringify(results));
                if(RResult.length === 0){
                    callback('sorry manager not exists');
                }
                callback((RResult[0].FirstName + ' ' + RResult[0].LastName).toLocaleLowerCase() + ' ' + params.employee_search_criteria + ' is ' + RResult[0].managerName);
            });
        }
        else if (params.employee_search_criteria === 'designation') {
            var connection = mysql.createConnection(credentials);
            connection.connect();
            connection.query("SELECT * FROM employee E JOIN designation D ON D.ID = E.DesignationID WHERE E.FirstName like '%" + params.firstName + "%' or E.LastName like '%" + params.lastName + "%'", function (error, results, fields) {
                connection.end();
                if (error) callback('buddy, \nplease check employee identification.');
                var RResult = JSON.parse(JSON.stringify(results));
                if(RResult.length === 0){
                    return callback('sorry designation not exists');
                }
                callback((RResult[0].FirstName + ' ' + RResult[0].LastName).toLocaleLowerCase() + ' ' + params.employee_search_criteria + ' is ' + RResult[0].Designation);
            });
        }
        else if (params.employee_search_criteria === 'role') {
            var connection = mysql.createConnection(credentials);
            connection.connect();
            connection.query("SELECT E.*, r.role_name FROM employee E JOIN roles r ON r.role_id = E.RoleID WHERE E.FirstName like '%" + params.firstName + "%' or E.LastName like '%" + params.lastName + "%'", function (error, results, fields) {
                connection.end();
                if (error) callback('buddy, \nplease check employee identification.');
                var RResult = JSON.parse(JSON.stringify(results));
                if(RResult.length === 0){
                    callback('sorry role not exists');
                }
                callback((RResult[0].FirstName + ' ' + RResult[0].LastName).toLocaleLowerCase() + ' ' + params.employee_search_criteria + ' is ' + RResult[0].role_name);
            });
        }
        else if (params.employee_search_criteria === 'jobtype') {
            var connection = mysql.createConnection(credentials);
            connection.connect();
            connection.query("SELECT E.*, r.role_name FROM employee E JOIN roles r ON r.role_id = E.RoleID WHERE E.FirstName like '%" + params.lastName + "%' or E.LastName like '%" + params.firstName + "%'", function (error, results, fields) {
                connection.end();
                if (error) callback('buddy, \nplease check employee identification.');
                var RResult = JSON.parse(JSON.stringify(results));
                if(RResult.length === 0){
                    callback('sorry jobtype not exists');
                }
                callback((RResult[0].FirstName + ' ' + RResult[0].LastName).toLocaleLowerCase() + ' ' + params.employee_search_criteria + ' is ' + RResult[0].JobType);
            });
        }
        else if (params.employee_search_criteria === 'ID') {
            var connection = mysql.createConnection(credentials);
            connection.connect();
            connection.query("SELECT E.*, r.role_name FROM employee E JOIN roles r ON r.role_id = E.RoleID WHERE E.FirstName like '%" + params.lastName + "%' or E.LastName like '%" + params.firstName + "%'", function (error, results, fields) {
                connection.end();
                if (error) callback('buddy, \nplease check employee identification.');
                var RResult = JSON.parse(JSON.stringify(results));
                if(RResult.length === 0){
                    callback('sorry ID not exists');
                }
                callback((RResult[0].FirstName + ' ' + RResult[0].LastName).toLocaleLowerCase() + ' ' + params.employee_search_criteria + ' is ' + RResult[0].ID);
            });
        }
        else if (params.employee_search_criteria === 'status') {
            var connection = mysql.createConnection(credentials);
            connection.connect();
            connection.query("SELECT E.*, r.role_name FROM employee E JOIN roles r ON r.role_id = E.RoleID WHERE E.FirstName like '%" + params.lastName + "%' or E.LastName like '%" + params.firstName + "%'", function (error, results, fields) {
                connection.end();
                if (error) callback('buddy, \nplease check employee identification.');
                var RResult = JSON.parse(JSON.stringify(results));
                if(RResult.length === 0){
                    callback('sorry status not exists');
                }
                callback((RResult[0].FirstName + ' ' + RResult[0].LastName).toLocaleLowerCase() + ' ' + params.employee_search_criteria + ' is ' + RResult[0].status ? ' Active' : 'Inactive');
            });
        }
        else if (params.employee_search_criteria === 'date of join') {
            var connection = mysql.createConnection(credentials);
            connection.connect();
            connection.query("SELECT E.*, r.role_name FROM employee E JOIN roles r ON r.role_id = E.RoleID WHERE E.FirstName like '%" + params.lastName + "%' or E.LastName like '%" + params.firstName + "%'", function (error, results, fields) {
                connection.end();
                if (error) callback('buddy, \nplease check employee identification.');
                var RResult = JSON.parse(JSON.stringify(results));
                if(RResult.length === 0){
                    callback('sorry date of joining not exists');
                }
                callback((RResult[0].FirstName + ' ' + RResult[0].LastName).toLocaleLowerCase() + ' ' + params.employee_search_criteria + ' is ' + new Date(RResult[0].Date_of_Joining));
            });
        }
        else if (params.employee_search_criteria === 'email') {
            var connection = mysql.createConnection(credentials);
            connection.connect();
            connection.query("SELECT E.*, r.role_name FROM employee E JOIN roles r ON r.role_id = E.RoleID WHERE E.FirstName like '%" + params.firstName + "%' or E.LastName like '%" + params.lastName + "%'", function (error, results, fields) {
                connection.end();
                if (error) callback('buddy, \nplease check employee identification.');
                var RResult = JSON.parse(JSON.stringify(results));
                if(RResult.length === 0){
                    callback('sorry email not exists');
                }
                callback((RResult[0].FirstName + ' ' + RResult[0].LastName).toLocaleLowerCase() + ' ' + params.employee_search_criteria + ' is ' + RResult[0].EmailID);
            });
        }
        else {
            callback('buddy, still i am in development mode');
        }
    }
    else { callback('validate'); }
};

