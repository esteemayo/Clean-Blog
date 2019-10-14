const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');


// CONTACT ROUTE
router.get('/', (req, res) => {
    res.render('contact');
});

// CONTACT-PAGE POST LOGIC WITH NODEMAILER
router.post('/', (req, res) => {
    let smtpTransporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'esteemdesign19@gmail.com',
            pass: 'princeadebayo'
        }
    });

    let mailOptions = {
        from: req.body.name + '&lt;' + req.body.telephone + '&gt;',
        to: 'esteemdesign19@gmail.com',
        subject: `${req.body.email} says: ${req.body.message}`
    }

    smtpTransporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            req.flash('error', err.message);
            res.redirect('/contact');
        } else {
            req.flash('success', 'Message successfully sent');
            res.redirect('/');
        }
    });
});



module.exports = router;