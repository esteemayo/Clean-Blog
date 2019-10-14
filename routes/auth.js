const express = require('express');
const router = express.Router();
const passport = require('passport');


// LOGIN ROUTE
router.get('/', (req, res) => {
    res.render('users/login');
});

// HANDLING LOGIN LOGIC
router.post('/', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/posts',
        failureRedirect: '/auth/login',
        successFlash: 'Welcome to Esteem Blog',
        failureFlash: true
    })(req, res, next);
});


module.exports = router;