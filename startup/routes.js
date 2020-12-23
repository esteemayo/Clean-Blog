const hpp = require('hpp');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const xss = require('xss-clean');
const express = require('express');
const passport = require('passport');
const flash = require('connect-flash');
const cookieparser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const methodeOverride = require('method-override');
const mongoSanitize = require('express-mongo-sanitize');

const globalErrorHandler = require('../controller/errorController');
const contactRouter = require('../routes/contact');
const postRouter = require('../routes/posts');
const AppError = require('../utils/appError');
const userRouter = require('../routes/users');
const viewRouter = require('../routes/view');
const helpers = require('../helpers');

module.exports = app => {
    // Passport config
    require('../config/passport')(passport);

    // Implement cors
    app.use(cors());

    // Access-Control-Allow-Origin
    app.options('*', cors());

    // view engine setup
    app.set('view engine', 'ejs');

    // Development logging
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }

    // Limit request from same api
    const limiter = rateLimit({
        max: 100,
        windowMs: 60 * 60 * 1000, // 1hr
        message: 'Too many requests from this IP, Please try again in an hour!'
    });

    app.use('/api', limiter);

    // Body parser
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // Cookie parser middleware
    app.use(cookieparser());

    // Data sanitization against NoSQL query injection
    app.use(mongoSanitize());

    // Data sanitization against XSS
    app.use(xss());

    // Prevent parameter pollution
    app.use(hpp({
        whitelist: [
            'title',
            'slug',
            'createdAt'
        ]
    }));

    // Serving static files
    app.use(express.static(path.join(`${__dirname}/../public`)));

    // Method override middleware
    app.use(methodeOverride('_method'));

    // Passport configuration
    app.use(require('express-session')({
        secret: 'secret',
        resave: false,
        saveUninitialized: false
    }));

    // Passport middlewares
    app.use(passport.initialize());
    app.use(passport.session());

    // Connect flash middleware
    app.use(flash());

    app.use((req, res, next) => {
        res.locals.h = helpers;
        res.locals.user = req.user || null;
        res.locals.error = req.flash('error');
        res.locals.success = req.flash('success');
        res.locals.info = req.flash('info');
        res.locals.currentPath = req.path;
        next();
    });

    // Test middleware
    app.use((req, res, next) => {
        req.requestTime = new Date().toISOString();
        next();
    });

    app.use('/', viewRouter);
    app.use('/', userRouter);
    app.use('/contact', contactRouter);
    app.use('/api/v1/posts', postRouter);

    app.all('/', (req, res, next) => {
        if (req.originalUrl === '/') return res.redirect('/posts');
        next();
    });

    app.all('*', (req, res, next) => {
        next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
    });

    app.use(globalErrorHandler);
};