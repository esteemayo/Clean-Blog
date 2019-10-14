const express = require('express');
const router = express.Router();
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');

// FORGOT PASSWORD ROUTE
router.get('/', (req, res) => {
    res.render('forgot');
});

// FORGOT PASSWORD LOGIC
router.post('/', (req, res, next) => {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, (err, buf) => {
                let token = buf.toString('hex');
                done(err, token);
            });
        },

        function (token, done) {
            User.findOne({ email: req.body.email }, (err, user) => {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000;   //1 Hour

                user.save(err => {
                    done(err, token, user);
                });
            });
        },

        function (token, user, done) {
            let smtpTransporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'esteemdesign19@gmail.com',
                    pass: 'princeadebayo'
                }
            });

            let mailOptions = {
                to: user.email,
                from: 'esteemdesign19@gmail.com',
                subject: 'Esteem Blog Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            }

            smtpTransporter.sendMail(mailOptions, err => {
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], err => {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});








module.exports = router;