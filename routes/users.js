const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// REGISTER ROUTE
router.get('/', (req, res) => {
    res.render('users/register');
});

// HANDLING REGISTER
router.post('/', (req, res) => {
    const { username, email, password } = req.body;
    let errors = [];

    if (!username || !email || !password) {
        errors.push({ text: 'Please all required fields must be filled out' });
    }

    if (password.length < 6) {
        errors.push({ text: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('users/register', {
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
                    res.render('users/register', {
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






module.exports = router;