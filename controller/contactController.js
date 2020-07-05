const nodemailer = require('nodemailer');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getContactForm = (req, res) => {
    res.status(200).render('contact', {
        title: 'Contact'
    });
};

exports.contact = catchAsync(async (req, res, next) => {
    const smtpTransporter = nodemailer.createTransport({
        service: '',
        auth: {
            user: '',
            pass: ''
        }
    });

    const mailOptions = {
        from: req.body.name + '&lt;' + req.body.telephone + '&gt;',
        to: '',
        subject: `${req.body.email} says: ${req.body.message}`
    }

    await smtpTransporter.sendMail(mailOptions);
    req.flash('success', 'Message successfully sent');
    res.status(200).redirect('/');
});