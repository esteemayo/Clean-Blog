const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const flash = require('connect-flash');
const passport = require('passport');
const methodeOverride = require('method-override');
const cookieparser = require('cookie-parser');
const path = require('path');


const AppError = require('../utils/appError');
const globalErrorHandler = require('../controller/errorController');
const viewRoute = require('../routes/view');
const userRoute = require('../routes/users');
const index = require('../routes/index');
const contactRoute = require('../routes/contact');

module.exports = app => {
    app.set('view engine', 'ejs');

    // Body parser middleware
    app.use(bodyParser.json({ limit: '10kb' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

    // Cookie parser middleware
    app.use(cookieparser());

    // Development logging
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }

    app.use(express.static(path.join(__dirname, '../public')));
    app.use(methodeOverride('_method'));

    // Connect flash middleware
    app.use(flash());

    // Passport configuration
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
    app.use('/contact', contactRoute);
    app.use('/', userRoute);
    app.use('/users', index);

    app.all('*', (req, res, next) => {
        return next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
    });

    app.use(globalErrorHandler);
};