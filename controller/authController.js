const _ = require('lodash');
const passport = require('passport');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const Post = require('../models/Post');
// const sendEmail = require('../utils/sendEmail');

exports.register = catchAsync(async (req, res, next) => {
    const newUser = _.pick(req.body, ['username', 'email', 'password', 'passwordConfirm', 'passwordChangedAt']);

    await User.create(newUser);

    req.flash('success', `You're now registered and can log in`);
    res.status(201).redirect('/auth/login');
});

exports.login = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/posts',
        failureRedirect: '/auth/login',
        successFlash: 'Welcome to Esteem Blog',
        failureFlash: true
    })(req, res, next);
};

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Logged you out');
    res.redirect('/auth/login');
};

exports.forgot = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address', 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/auth/reset/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and 
    passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, 
    please ignore this email!`;


    try {
        // const resetURL = `${req.protocol}://${req.get('host')}/auth/reset/${resetToken}`;

        // await new sendEmail(user, resetURL).sendPasswordReset();

        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            message
        });

        req.flash('success', `An e-mail has been sent to ${user.email} with further instructions.`);
        res.status(200).redirect('back');

    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).redirect('/auth/forgot');
    }
});

exports.resetPasswordForm = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.status(401).redirect('/auth/forgot');
    }
    res.status(200).render('reset', {
        title: 'Reset your account password',
        token: req.params.token
    });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });

    // If token has not expired, and there is user, set the new password
    if (!user) {
        // return next(new AppError('Token is invalid or has expired', 400));
        req.flash('error', 'Token is invalid or has expired.');
        return res.redirect('back');
    }

    user.password = req.body.password;
    user.confirm = req.body.confirm;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.flash('success', 'Success! Your password has been changed.');
    res.status(200).redirect('/posts');
});

exports.protect = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.flash('error', 'Not Authorized');
    return res.status(401).redirect('/auth/login');
};

exports.checkPostOwnership = catchAsync(async (req, res, next) => {
    if (req.isAuthenticated()) {
        const post = await Post.findById(req.params.id);

        if (post.author.id.equals(req.user.id)) {
            next();
        } else {
            req.flash('error', 'Not Authorized');
            res.status(401).redirect('/');
        }
    } else {
        req.flash('error', 'Not Authorized');
        res.status(401).redirect('/posts');
    }
});

exports.registerForm = (req, res) => {
    if (req.isAuthenticated()) return res.status(200).redirect('/posts');

    res.status(200).render('users/register', {
        title: 'Create your user account!'
    });
};

exports.loginForm = (req, res) => {
    if (req.isAuthenticated()) return res.status(200).redirect('/posts');

    res.status(200).render('users/login', {
        title: 'Log in into your account!'
    });
};

exports.forgotForm = (req, res) => {
    if (req.isAuthenticated()) return res.status(200).redirect('/posts');

    res.status(200).render('forgot', {
        title: 'Forgot password!'
    });
};

exports.apiLogin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password'));
    }

    user.password = undefined;

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});