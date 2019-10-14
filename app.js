require('dotenv').config();
const express = require('express');
const passport = require('passport');

const app = express();

require('./startup/routes')(app);
require('./startup/db')();

// PASSPORT CONFIG
require('./config/passport')(passport);




const port = process.env.PORT || 4001;

app.listen(port, () => console.log(`APP LISTENING ON PORT ${port}`));