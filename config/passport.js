const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = passport => {
    passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
        // MATCH USER
        User.findOne({email: email})
            .then(user => {
                if (!user) {
                    return done(null, false, {message: 'No User Found'});
                }

                // MATCH PASSWORD
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;

                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, {message: 'Password Incorrect'});
                    }
                });
            });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
}