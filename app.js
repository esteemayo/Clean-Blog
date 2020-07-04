require('dotenv').config();
const express = require('express');
const passport = require('passport');

const app = express();

require('./startup/routes')(app);

// PASSPORT CONFIG
require('./config/passport')(passport);




module.exports = app;