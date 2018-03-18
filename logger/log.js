var fs = require('fs');
var file_path = './logger/log/';
var mail = require('../nodemailer');

module.exports.writeLog = function (msg) {
    var fileName = (new Date()).getFullYear() + '_' + (new Date()).getWeek() + '.log';
    fs.open(file_path + fileName, 'a', (err, fd) => {
        if (err) throw err;
        fs.appendFile(fd, '\n' + new Date() + ' : ' + msg, 'utf8', (err) => {
            fs.close(fd, (err) => { if (err) throw err; });
            if (err) throw err;
        });
    });
};
module.exports.errorLog = function (msg) {
    fs.open(file_path + 'error.log', 'a', (err, fd) => {
        if (err) throw err;
        fs.appendFile(fd, '\n' + new Date() + ' : ' + msg, 'utf8', (err) => {
            fs.close(fd, (err) => { if (err) throw err; });
            if (err) throw err;
        });
    });
    //mail.sendMail({ to: "ashok_palla@merilytics.com", subject: "Error in meritus bot", text: JSON.stringify(msg) });
};
Date.prototype.getWeek = function () {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};