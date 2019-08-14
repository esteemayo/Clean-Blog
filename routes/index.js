const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Post = require('../models/post');
const bcrypt = require('bcryptjs');
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { ensureAuthenticated } = require('../helpers/auth');


// REGISTER ROUTE
router.get('/auth/register', (req, res) => {
    res.render('register');
});

// HANDLING REGISTER
router.post('/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    let errors = [];

    if (!username || !email || !password) {
        errors.push({ text: 'Please all required fields must be filled out' });
    }

    if (password.length < 6) {
        errors.push({ text: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            username,
            email,
            password
        });
    } else {
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    errors.push({ text: 'Email already registered' });
                    res.render('register', {
                        errors,
                        username,
                        email,
                        password
                    });
                } else {
                    const newUser = new User({
                        username,
                        email,
                        password
                    })

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;

                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    req.flash('success', 'You\'re now registered and can log in');
                                    res.redirect('/auth/login');
                                })
                                .catch(err => {
                                    console.log(err);
                                    return;
                                });
                        });
                    });
                }
            })
    }
});

// LOGIN ROUTE
router.get('/auth/login', (req, res) => {
    res.render('login');
});

// HANDLING LOGIN LOGIC
router.post('/auth/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        successFlash: 'Welcome to Esteem Blog',
        failureFlash: true
    })(req, res, next);
});

// LOGOUT ROUTE
router.get('/auth/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Logged you out');
    res.redirect('/auth/login');
});

// FORGOT PASSWORD ROUTE
router.get('/forgot', (req, res) => {
    res.render('forgot');
});

// FORGOT PASSWORD LOGIC
router.post('/forgot', (req, res, next) => {
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

router.get('/reset/:token', (req, res) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', { token: req.params.token });
    });
});

router.post('/reset/:token', (req, res) => {
    async.waterfall([
        function (done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.')
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, err => {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(err => {
                            req.logIn(user => {
                                done(err, user);
                            });
                        });
                    });
                } else {
                    req.flash('error', 'Password do not match!');
                    return res.redirect('back');
                }
            });
        },

        function (user, done) {
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
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            }

            smtpTransporter.sendMail(mailOptions, err => {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], err => {
        res.redirect('/');
    });
});

// USER PROFILE
// router.get('/users/:id', ensureAuthenticated, (req, res) => {
//     User.findById(req.params.id, (err, user) => {
//         if (err) {
//             console.log(err);
//             req.flash('error', 'Something went wrong');
//             res.redirect('/');
//         } else {
//             Post.find().where('author.id').equals(user._id).exec((err, post) => {
//                 if (err) {
//                     console.log(err);
//                     req.flash('error', 'Something went wrong');
//                     res.redirect('/');
//                 } else {
//                     res.render('user', { user: user, posts: post });
//                 }
//             });
//         }
//     });
// });


router.get('/users/:id', ensureAuthenticated, async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        let posts = await Post.find().where('author.id').equals(user._id).exec();
        res.render('user', { user, posts });
    } catch (err) {
        console.log(err);
        req.flash('error', 'Something went wrong');
        res.redirect('/');
    }
});






module.exports = router;