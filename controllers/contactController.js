const nodemailer = require('nodemailer');
const catchAsync = require('../utils/catchAsync');

exports.getContactForm = (req, res) => {
    res.status(200).render('contact', {
        title: 'Contact us'
    });
};

exports.contact = catchAsync(async (req, res, next) => {
    const smtpTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
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