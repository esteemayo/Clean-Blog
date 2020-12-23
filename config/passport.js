const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

module.exports = passport => {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        // Match user
        const user = await User.findOne({ email })
        if (!user) {
            return done(null, false, { message: 'Incorrect email or password' });
        }

        try {
            // Validate password
            const isValid = await user.correctPassword(password, user.password);

            if (!isValid) {
                return done(null, false, { message: 'Incorrect email or password' });
            }

            // Check if account has been verified
            if (!user.active) {
                return done(null, false, { message:'Your account has not been verified. Please check your email to verify your account' });
            }

            return done(null, user);
        } catch (err) {
            console.log(err);
        }
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