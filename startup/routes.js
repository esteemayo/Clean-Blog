const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const passport = require('passport');
const methodeOverride = require('method-override');
const cookieparser = require('cookie-parser');
const path = require('path');


const AppError = require('../utils/appError');
const globalErrorHandler = require('../controller/errorController');
const viewRoute = require('../routes/view');
const post = require('../routes/post');
const users = require('../routes/users');
const auth = require('../routes/auth');
const index = require('../routes/index');
const logout = require('../routes/logout');
const about = require('../routes/about');
const contact = require('../routes/contact');
const forgot = require('../routes/forgot');
const reset = require('../routes/reset');

module.exports = app => {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(methodeOverride('_method'));
    app.use(cookieparser());
    app.use(flash());

    // PASSPORT CONFIGURATION
    app.use(require('express-session')({
        secret: 'secret',
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use((req, res, next) => {
        res.locals.user = req.user || null;
        res.locals.error = req.flash('error');
        res.locals.success = req.flash('success');
        next();
    });

    // Test middleware
    app.use((req, res, next) => {
        req.requestTime = new Date().toISOString();
        next();
    });

    app.use('/', viewRoute);
    // app.use('/posts', post);
    app.use('/users/register', users);
    app.use('/auth/login', auth);
    app.use('/auth/logout', logout);
    app.use('/users', index);
    app.use('/about', about);
    app.use('/contact', contact);
    app.use('/forgot', forgot);
    app.use('/reset', reset);

    app.all('*', (req, res, next) => {
        return next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
    });

    app.use(globalErrorHandler);
};