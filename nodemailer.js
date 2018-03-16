const nodemailer = require('nodemailer');
const log = require('./logger/log');
const fs = require('fs');

const account = { "user": "ashok_palla@merilytics.com", "pass": "G4jrEPqzxv1" };

let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: { user: account.user, pass: account.pass }
});
module.exports.sendMail = function (receiversDetails) {
    fs.readFile('./template/error_mail.html', { encoding: 'utf-8' }, function (err, html) {
        if (err) { } else {  receiversDetails.html = html.replace('###MSG###', JSON.parse(receiversDetails.text)); }
        sendMail(receiversDetails);
    });
}
function sendMail(receiversDetails) {
    let mailOptions = {
        from: account.user, // sender address
        to: receiversDetails.to, // list of receivers
        subject: receiversDetails.subject, // Subject line
        text: receiversDetails.html ? null : receiversDetails.text, // plain text body
        html: receiversDetails.html ? receiversDetails.html : null // html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) { return log.errorLog(error); }
        log.writeLog(JSON.stringify(info));
    });
}