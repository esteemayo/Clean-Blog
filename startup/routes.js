const hpp = require('hpp');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const express = require('express');
const passport = require('passport');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const compression = require('compression');
const cookieparser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const methodeOverride = require('method-override');
const mongoSanitize = require('express-mongo-sanitize');


const globalErrorHandler = require('../controller/errorController');
const contactRoute = require('../routes/contact');
const postRoute = require('../routes/postRoute');
const AppError = require('../utils/appError');
const userRoute = require('../routes/users');
const viewRoute = require('../routes/view');
const index = require('../routes/index');

module.exports = app => {
    // Passport config
    require('../config/passport')(passport);

    // Implement cors
    app.use(cors());

    // Access-Control-Allow-Origin
    app.options('*', cors());

    // view engine setup
    app.set('view engine', 'ejs');

    // Set security http headers
    app.use(helmet());

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

    // Body parser middleware
    app.use(bodyParser.json({ limit: '10kb' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

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

    // Compression middleware
    app.use(compression());

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
    app.use('/', userRoute);
    app.use('/users', index);
    app.use('/contact', contactRoute);
    app.use('/api/v1/posts', postRoute);

    app.all('/', (req, res, next) => {
        if (req.originalUrl === '/') return res.redirect('/posts');
        next();
    });

    app.all('*', (req, res, next) => {
        return next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
    });

    app.use(globalErrorHandler);
};