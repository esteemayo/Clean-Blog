require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const methodeOverride = require('method-override');
// const path = require('path');
const Post = require('./models/post');
const User = require('./models/user');

const postRoute = require('./routes/post');
const indexRoute = require('./routes/index');

const app = express();

// PASSPORT CONFIG
require('./config/passport')(passport);

mongoose.connect('mongodb://localhost:27017/esteem-blog-app', {
    useNewUrlParser: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(methodeOverride('_method'));
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
    res.locals.user = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});


app.use(postRoute);
app.use(indexRoute);









const port = process.env.PORT || 4001;

app.listen(port, () => console.log(`APP LISTENING ON PORT ${port}`));