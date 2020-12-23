const _ = require('lodash');
const crypto = require('crypto');
const passport = require('passport');
const User = require('../models/User');
const Post = require('../models/Post');
const sendEmail = require('../utils/email');
const catchAsync = require('../utils/catchAsync');

exports.register = catchAsync(async (req, res, next) => {
    const newUser = _.pick(req.body, ['username', 'name', 'email', 'role', 'password', 'passwordConfirm', 'passwordChangedAt']);

    const user = new User(newUser);

    const verifyToken = user.createEmailVerificationToken();
    await user.save();

    const verifyURL = `${req.protocol}://${req.get('host')}/users/verify-account`;

    const message = `
        Hi ${user.name},
        Please verify your email by typing the following token: ${verifyToken}
        On the following page: ${verifyURL}
        Have a pleasant day!
    `;

    const html = `
        <h3>Hi ${user.name},</h3>
        <p>Please verify your email by typing the following token: ${verifyToken}</p>
        <p>On the following page: <a href="${verifyURL}">Verify your email</a></p>
        <p>Have a pleasant day!</p>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Please verify your account email address.',
            message,
            html
        });

        const successMsg = `
            A confirmation message has been sent to your registered email address. 
            Please follow the instructions in the email to activate your account. 
            Once you have activated your account, you will be able to sign in to CLEAN BLOG.
        `;

        req.flash('success', successMsg);
        res.redirect('/auth/login');
    } catch (err) {
        user.verifyToken = undefined;
        await user.save();

        req.flash('error', 'There was an error sending the email. Try again later.');
        return res.redirect('/users/register');
    }
});

exports.verify = catchAsync(async (req, res, next) => {
    // find the account that matches the secret token
    const user = await User.findOne({ 'verifyToken': req.body.verifyToken });

    if (!user) {
        req.flash('error', 'Oops! Token is invalid. Please contact us for assistance');
        return res.redirect('back');
    }

    user.active = true;
    user.verifyToken = undefined;
    await user.save();

    req.flash('success', 'User account activated successfully. You may now sign in to CLEAN BLOG.');
    res.redirect('/auth/login');
});

exports.login = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/posts',
        failureRedirect: '/auth/login',
        successFlash: 'Welcome to Clean Blog',
        failureFlash: true
    })(req, res, next);
};

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out! 👋');
    res.redirect('/auth/login');
};

exports.forgot = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ 'email': req.body.email });

    if (!user) {
        req.flash('error', 'There is no user with email address');
        return res.redirect('/auth/forgot');
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/auth/reset/${resetToken}`;

    const message = `
        Forgot your password? Submit a PATCH request with your new password and 
        passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, 
        please ignore this email!
    `;

    const html = `
        <h3>Hello ${user.name},</h3>
        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <p><a href="${resetURL}">Reset link</a></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 1 hour)',
            message,
            html
        });

        req.flash('success', `An e-mail has been sent to ${user.email} with further instructions.`);
        res.status(200).redirect('/auth/login');
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });

        req.flash('error', 'There was an error sending the email. Please try again later!');
        return res.redirect('/auth/forgot');
    }
});

exports.resetPasswordForm = catchAsync(async (req, res, next) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/auth/forgot');
    }

    res.status(200).render('users/reset', {
        title: 'Reset your account password'
    });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });

    // If token has not expired, and there is user, set the new password
    if (!user) {
        req.flash('error', 'Token is invalid or has expired.');
        return res.redirect('back');
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Redirect the user to login page
    req.flash('success', 'Success! Your password has been changed.');
    res.redirect('/auth/login');
});

exports.protect = (req, res, next) => {
    if (req.isAuthenticated()) return next();

    req.flash('error', 'Oops you must be logged in to do that!');
    return res.redirect('/auth/login');
};

exports.checkPostOwnership = catchAsync(async (req, res, next) => {
    if (req.isAuthenticated()) {
        const post = await Post.findById(req.params.id);

        if (post.author.id.equals(req.user.id)) return next();

        req.flash('error', 'You do not have permission to perform this action.');
        return res.redirect('/');
    }
    req.flash('error', 'Oops you must be logged in to do that!');
    res.redirect('/posts');
});

exports.updateUserData = catchAsync(async (req, res, next) => {
    const filterBody = _.pick(req.body, ['username', 'name', 'email']);

    await User.findByIdAndUpdate(req.user._id, filterBody, {
        new: true,
        runValidators: true
    });

    req.flash('success', 'Your data has been successfully updated.');
    res.redirect('back');
});

exports.confirmPassword = (req, res, next) => {
    if (req.body.password === req.body.passwordConfirm) return next();

    req.flash('error', 'Passwords do not match.');
    return res.redirect('back');
};

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        req.flash('error', 'Your current password is wrong.')
        return res.redirect('back');
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    req.flash('success', 'Password successfully updated.');
    res.redirect('back');
});

exports.profile = catchAsync(async (req, res, next) => {
    const page = req.params.page * 1 || 1;
    const limit = 3;
    const skip = (page * limit) - limit;

    const userPromise = User.findOne({ 'username': req.params.username })

    const postsPromise = Post
        .find({ 'author.username': req.params.username })
        .skip(skip)
        .limit(limit);

    const countPromise = Post.find({ 'author.username': req.params.username }).countDocuments();

    const [userProfile, posts, count] = await Promise.all([userPromise, postsPromise, countPromise]);

    const pages = Math.ceil(count / limit);

    if (!posts.length && skip) {
        req.flash('info', `Hey! You asked for page ${page}. But that doesn't exist. So I put you on page ${pages}`);
        return res.redirect(`/users/profile/${userProfile.username}/page/${pages}`);
    }

    res.status(200).render('users/profile', {
        title: `${userProfile.name}'s profile!`,
        posts,
        userProfile,
        count,
        pages,
        page
    });
});

exports.registerForm = (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/posts');

    res.status(200).render('users/register', {
        title: 'Create your user account!'
    });
};

exports.loginForm = (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/posts');

    res.status(200).render('users/login', {
        title: 'Log in into your account!'
    });
};

exports.forgotForm = (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/posts');

    res.status(200).render('users/forgot', {
        title: 'Forgot password!'
    });
};

exports.account = (req, res) => {
    res.status(200).render('users/account', {
        title: 'User account settings'
    });
};

exports.verifyForm = (req, res) => {
    if (req.isAuthenticated()) return res.status('/');

    res.status(200).render('users/verify', {
        title: 'Verify your account email address'
    });
};